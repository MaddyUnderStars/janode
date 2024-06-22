'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This module contains the Unix Sockets transport implementation.
 * @module transport-unix
 * @access private
 */
const buffer_1 = require("buffer");
const fs_1 = require("fs");
/* External dependency with Unix dgram sockets implementation */
const unix_dgram_1 = require("unix-dgram");
const logger_js_1 = __importDefault(require("./utils/logger.js"));
const LOG_NS = '[transport-unix.js]';
const utils_js_1 = require("./utils/utils.js");
/**
 * Class representing a connection through Unix dgram sockets transport.<br>
 *
 * In case of failure a connection will be retried according to the configuration (time interval and
 * times to attempt). At every attempt, if multiple addresses are available for Janus, the next address
 * will be tried. An error will be raised only if the maxmimum number of attempts have been reached.<br>
 *
 * @private
 */
class TransportUnix {
    /**
     * Create a connection through Unix dgram socket.
     *
     * @param {module:connection~Connection} connection - The parent Janode connection
     */
    constructor(connection) {
        /**
         * The parent  Janode connection.
         *
         * @type {module:connection~Connection}
         */
        this._connection = connection;
        /**
         * The internal Unix Socket.
         *
         * @type {module:unix-dgram~Socket}
         */
        this._socket = null;
        /**
         * The local file to bind the socket to.
         */
        this._local_bind = `/tmp/.janode-${connection.id}`;
        /**
         * Internal counter for connection attempts.
         *
         * @type {number}
         */
        this._attempts = 0;
        /**
         * A boolean flag indicating that the connection is being opened.
         *
         * @type {boolean}
         */
        this._opening = false;
        /**
         * A boolean flag indicating that the connection has been opened.
         *
         * @type {boolean}
         */
        this._opened = false;
        /**
         * A boolean flag indicating that the connection is being closed.
         *
         * @type {boolean}
         */
        this._closing = false;
        /**
         * A boolean flag indicating that the connection has been closed.
         *
         * @type {boolean}
         */
        this._closed = false; // true if socket has been closed after being opened
        /**
         * A numerical identifier assigned for logging purposes.
         *
         * @type {number}
         */
        this.id = connection.id;
        /**
         * A more descriptive, not unique string (used for logging).
         *
         * @type {string}
         */
        this.name = `[${this.id}]`;
    }
    /**
     * Initialize the internal socket.
     *
     * @returns {Promise<module:connection~Connection>}
     */
    _initUnixSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_js_1.default.info(`${LOG_NS} ${this.name} trying connection with ${this._connection._address_iterator.currElem().url}`);
            return new Promise((resolve, reject) => {
                let socket;
                let connected = false;
                let bound = false;
                try {
                    socket = (0, unix_dgram_1.createSocket)('unix_dgram');
                }
                catch (error) {
                    logger_js_1.default.error(`${LOG_NS} ${this.name} unix socket create error (${error.message})`);
                    reject(error);
                    return;
                }
                socket.on('error', error => {
                    logger_js_1.default.error(`${LOG_NS} ${this.name} unix socket error (${error.message})`);
                    if (error.errno < 0) {
                        this._close();
                    }
                    reject(error);
                });
                socket.on('connect', _ => {
                    logger_js_1.default.info(`${LOG_NS} ${this.name} unix socket connected`);
                    connected = true;
                    if (bound && connected)
                        resolve(this);
                });
                socket.on('listening', _ => {
                    logger_js_1.default.info(`${LOG_NS} ${this.name} unix socket bound`);
                    /* Resolve the promise and return this connection */
                    bound = true;
                    socket.connect(this._connection._address_iterator.currElem().url.split('file://')[1]);
                    if (bound && connected)
                        resolve(this);
                });
                socket.on('message', buf => {
                    const data = buf.toString();
                    logger_js_1.default.debug(`${LOG_NS} ${this.name} <unix RCV OK> ${data}`);
                    this._connection._handleMessage(JSON.parse(data));
                });
                socket.on('writable', _ => {
                    logger_js_1.default.warn(`${LOG_NS} ${this.name} unix socket writable notification`);
                });
                socket.on('congestion', _buf => {
                    logger_js_1.default.warn(`${LOG_NS} ${this.name} unix socket congestion notification`);
                });
                this._socket = socket;
                try {
                    (0, fs_1.unlinkSync)(this._local_bind);
                }
                catch (_error) { }
                socket.bind(this._local_bind);
            });
        });
    }
    /**
     * Internal helper to open a unix socket connection.
     * In case of error retry the connection with another address from the available pool.
     * If maximum number of attempts is reached, throws an error.
     *
     * @returns {module:unix-dgram~Socket} The unix socket
     */
    _attemptOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            /* Reset status at every attempt */
            this._opened = false;
            this._closing = false;
            this._closed = false;
            try {
                const conn = yield this._initUnixSocket();
                this._opening = false;
                this._opened = true;
                return conn;
            }
            catch (error) {
                /* In case of error notifies the user, but try with another address */
                this._attempts++;
                /* Get the max number of attempts from the configuration */
                if (this._attempts >= this._connection._config.getMaxRetries()) {
                    this._opening = false;
                    const err = new Error('attempt limit exceeded');
                    logger_js_1.default.error(`${LOG_NS} ${this.name} socket connection failed, ${err.message}`);
                    throw error;
                }
                logger_js_1.default.error(`${LOG_NS} ${this.name} socket connection failed, will try again in ${this._connection._config.getRetryTimeSeconds()} seconds...`);
                /* Wait an amount of seconds specified in the configuration */
                yield (0, utils_js_1.delayOp)(this._connection._config.getRetryTimeSeconds() * 1000);
                /* Make shift the circular iterator */
                this._connection._address_iterator.nextElem();
                return this._attemptOpen();
            }
        });
    }
    _close() {
        if (!this._socket)
            return;
        logger_js_1.default.info(`${LOG_NS} ${this.name} closing unix transport`);
        try {
            this._socket.close();
        }
        catch (error) {
            logger_js_1.default.error(`${LOG_NS} ${this.name} error while closing unix socket (${error.message})`);
        }
        try {
            (0, fs_1.unlinkSync)(this._local_bind);
        }
        catch (error) {
            logger_js_1.default.error(`${LOG_NS} ${this.name} error while unlinking fd (${error.message})`);
        }
        /* removeAllListeners is only supported on the node ws module */
        if (typeof this._socket.removeAllListeners === 'function')
            this._socket.removeAllListeners();
        this._socket = null;
        this._connection._signalClose(this._closing);
        this._closing = false;
        this._closed = true;
    }
    /**
     * Open a transport connection. This is called from parent connection.
     *
     * @returns {Promise<module:connection~Connection>} A promise resolving with the Janode connection
     */
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            /* Check the flags before attempting a connection */
            let error;
            if (this._opening)
                error = new Error('unable to open, unix socket is already being opened');
            else if (this._opened)
                error = new Error('unable to open, unix socket has already been opened');
            else if (this._closed)
                error = new Error('unable to open, unix socket has already been closed');
            if (error) {
                logger_js_1.default.error(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            /* Set the starting status */
            this._opening = true;
            this._attempts = 0;
            /* Use internal helper */
            return this._attemptOpen();
        });
    }
    /**
     * Get the remote Janus hostname.
     * It is called from the parent connection.
     *
     * @returns {string} The hostname of the Janus server
     */
    getRemoteHostname() {
        if (this._opened) {
            return (this._connection._address_iterator.currElem().url.split('file://')[1]);
        }
        return null;
    }
    /**
     * Gracefully close the connection.
     * It is called from the parent connection.
     *
     * @returns {Promise<void>}
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            /* Check the status flags before */
            let error;
            if (!this._opened)
                error = new Error('unable to close, unix socket has never been opened');
            else if (this._closing)
                error = new Error('unable to close, unix socket is already being closed');
            else if (this._closed)
                error = new Error('unable to close, unix socket has already been closed');
            if (error) {
                logger_js_1.default.error(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            this._closing = true;
            return this._close();
        });
    }
    /**
     * Send a request from this connection.
     * It is called from the parent connection.
     *
     * @param {object} request - The request to be sent
     * @returns {Promise<object>} A promise resolving with a response from Janus
     */
    send(request) {
        return __awaiter(this, void 0, void 0, function* () {
            /* Check connection status */
            let error;
            if (!this._opened)
                error = new Error('unable to send request because unix socket has not been opened');
            else if (this._closed)
                error = new Error('unable to send request because unix socket has been closed');
            if (error) {
                logger_js_1.default.error(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            /* Stringify the message */
            const string_req = JSON.stringify(request);
            const buf = buffer_1.Buffer.from(string_req, 'utf-8');
            return new Promise((resolve, reject) => {
                this._socket.send(buf, error => {
                    if (error) {
                        logger_js_1.default.error(`${LOG_NS} ${this.name} unix socket send error (${error.message})`);
                        if (error.errno < 0) {
                            this._close();
                        }
                        reject(error);
                        return;
                    }
                    logger_js_1.default.debug(`${LOG_NS} ${this.name} <unix SND OK> ${string_req}`);
                    resolve();
                });
            });
        });
    }
}
exports.default = TransportUnix;
