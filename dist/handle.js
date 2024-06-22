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
 * This module contains the Handle class definition.
 * @module handle
 * @access private
 */
const events_1 = require("events");
const logger_js_1 = __importDefault(require("./utils/logger.js"));
const LOG_NS = '[handle.js]';
const utils_js_1 = require("./utils/utils.js");
const protocol_js_1 = require("./protocol.js");
/**
 * Class representing a Janode handle.<br>
 *
 * Users implementing new plugins must extend this class and override the `handleMessage` function.<br>
 *
 * Handle extends EventEmitter, so an instance can emit events and users can subscribe to them.<br>
 *
 * Users are not expected to create Handle instances, but insted use the Session.attach() API.
 *
 * @hideconstructor
 */
class Handle extends events_1.EventEmitter {
    /**
     * Create a Janode handle.
     *
     * @param {module:session~Session} session - A reference to the parent session
     * @param {number} id - The handle identifier
     */
    constructor(session, id) {
        super();
        /**
         * The transaction manager used by this handle.
         *
         * @private
         * @type {TransactionManager}
         */
        this._tm = session._tm; // keep track of pending requests
        /**
         * A boolean flag indicating that the handle is being detached.
         * Once the detach has been completed, the flag returns to false.
         *
         * @private
         * @type {boolean}
         */
        this._detaching = false;
        /**
         * A boolean flag indicating that the handle has been detached.
         *
         * @private
         * @type {boolean}
         */
        this._detached = false;
        /**
         * The parent Janode session.
         *
         * @type {Session}
         */
        this.session = session;
        /**
         * The handle unique id, usually taken from Janus response.
         *
         * @type {number}
         */
        this.id = id;
        /**
         * A more descriptive, not unique string (used for logging).
         *
         * @type {string}
         */
        this.name = `[${this.id}]`;
        /**
         * The callback function used for a session destroyed event.
         *
         * @private
         */
        this._sessionDestroyedListener = this._signalDetach.bind(this);
        /* Set a listener to run a callback when session gets destroyed */
        this.session.once(protocol_js_1.JANODE.EVENT.SESSION_DESTROYED, this._sessionDestroyedListener);
        /* Set a dummy error listener to avoid to avoid unmanaged errors */
        this.on('error', e => `${LOG_NS} ${this.name} catched unmanaged error ${e.message}`);
    }
    /**
     * Cleanup the handle closing all owned transactions, emitting the detached event
     * and removing all registered listeners.
     *
     * @private
     */
    _signalDetach() {
        if (this._detached)
            return;
        this._detaching = false;
        this._detached = true;
        /* Remove the listener for session destroyed event */
        this.session.removeListener(protocol_js_1.JANODE.EVENT.SESSION_DESTROYED, this._sessionDestroyedListener);
        /* Close all pending transactions for this handle with an error */
        this._tm.closeAllTransactionsWithError(this, new Error('handle detached'));
        /* Emit the detached event */
        /**
         * The handle has been detached.
         *
         * @event module:handle~Handle#event:HANDLE_DETACHED
         * @type {object}
         * @property {number} id - The handle identifier
         */
        this.emit(protocol_js_1.JANODE.EVENT.HANDLE_DETACHED, { id: this.id });
        /* Remove all listeners to avoid leaks */
        this.removeAllListeners();
    }
    /**
     * Helper to check if a pending transaction is a trickle.
     *
     * @private
     * @param {string} id - The transaction identifier
     * @returns {boolean}
     */
    _isTrickleTx(id) {
        const tx = this._tm.get(id);
        if (tx)
            return tx.request === protocol_js_1.JANUS.REQUEST.TRICKLE;
        return false;
    }
    /**
     * Helper to check if a pending transaction is a hangup.
     *
     * @private
     * @param {string} id - The transaction identifier
     * @returns {boolean}
     */
    _isHangupTx(id) {
        const tx = this._tm.get(id);
        if (tx)
            return tx.request === protocol_js_1.JANUS.REQUEST.HANGUP;
        return false;
    }
    /**
     * Helper to check if a pending transaction is a detach.
     *
     * @private
     * @param {string} id - The transaction identifier
     * @returns {boolean}
     */
    _isDetachTx(id) {
        const tx = this._tm.get(id);
        if (tx)
            return tx.request === protocol_js_1.JANUS.REQUEST.DETACH_PLUGIN;
        return false;
    }
    /**
     * Manage a message sent to this handle. If this involves a owned transaction
     * and the response is a definitive one, the transaction will be closed.
     * In case the instance implements a `handleMessage` method, this function will
     * pass the message to it on order to let a plugin implements its custom logic.
     * Generic Janus API events like `detached`, `hangup` etc. are handled here.
     *
     * @private
     * @param {object} janus_message
     */
    _handleMessage(janus_message) {
        const { transaction, janus } = janus_message;
        /* First check if a transaction is involved */
        if (transaction) {
            logger_js_1.default.verbose(`${LOG_NS} ${this.name} received ${janus} for transaction ${transaction}`);
            /* First check if this handle owns the transaction */
            if (this.ownsTransaction(transaction)) {
                /*
                 * Pending transaction management. Close transaction in case of:
                 * 1) Ack response to a trickle request
                 * 2) Definitive (success/error) response
                 */
                /* Case #1: close tx related to trickles */
                if ((0, protocol_js_1.isAckData)(janus_message)) {
                    if (this._isTrickleTx(transaction)) {
                        this.closeTransactionWithSuccess(transaction, janus_message);
                    }
                    return;
                }
                /* Case #2: close tx with a definitive response */
                if ((0, protocol_js_1.isResponseData)(janus_message)) {
                    if ((0, protocol_js_1.isErrorData)(janus_message)) {
                        /* Case #2 (error): close tx with a definitive error */
                        const error = new Error(`${janus_message.error.code} ${janus_message.error.reason}`);
                        this.closeTransactionWithError(transaction, error);
                        return;
                    }
                    /* Case #2 (success) */
                    /* Close hangup Tx */
                    if (this._isHangupTx(transaction)) {
                        this.closeTransactionWithSuccess(transaction, janus_message);
                        return;
                    }
                    /* Close detach tx */
                    if (this._isDetachTx(transaction)) {
                        this.closeTransactionWithSuccess(transaction, janus_message);
                        return;
                    }
                    /*
                     * If an instance implements a handleMessage method, try to use it.
                     * The custom handler may decide to close tx with success or error.
                     * A falsy return from handleMessage is considered as a "not-handled" message.
                     */
                    if (!this.handleMessage(janus_message)) {
                        logger_js_1.default.verbose(`${LOG_NS} ${this.name} received response could not be handled by the plugin`);
                    }
                    /*
                     * As a fallback always close with success a transaction with a definitive success response.
                     * Closing a transaction is an indempotent action.
                     */
                    this.closeTransactionWithSuccess(transaction, janus_message);
                    return;
                }
            }
        }
        /* Handling of a message that did not close a transaction (e.g. async events) */
        const janode_event_data = {};
        switch (janus) {
            /* Generic Janus event */
            case protocol_js_1.JANUS.EVENT.EVENT: {
                /* If an instance implements a handleMessage method, use it */
                if (!this.handleMessage(janus_message)) {
                    /* If handleMessage has a falsy return close tx with error */
                    logger_js_1.default.warn(`${LOG_NS} ${this.name} received event could not be handled by the plugin`);
                    const error = new Error('unmanaged event');
                    this.closeTransactionWithError(transaction, error);
                }
                else {
                    /* If handleMessage has a truthy return close tx with success */
                    this.closeTransactionWithSuccess(transaction, janus_message);
                }
                break;
            }
            /* Detached event: the handle has been detached */
            case protocol_js_1.JANUS.EVENT.DETACHED: {
                this._signalDetach();
                break;
            }
            /* ice-failed event: Janus ICE agent has detected a failure */
            case protocol_js_1.JANUS.EVENT.ICE_FAILED: {
                /**
                 * The handle has detected an ICE failure.
                 *
                 * @event module:handle~Handle#event:HANDLE_ICE_FAILED
                 * @type {object}
                 */
                this.emit(protocol_js_1.JANODE.EVENT.HANDLE_ICE_FAILED, janode_event_data);
                break;
            }
            /* Hangup event: peer connection is down */
            /* In this case the janus message has a reason field */
            case protocol_js_1.JANUS.EVENT.HANGUP: {
                if (typeof janus_message.reason !== 'undefined')
                    janode_event_data.reason = janus_message.reason;
                /**
                 * The handle WebRTC connection has been closed.
                 *
                 * @event module:handle~Handle#event:HANDLE_HANGUP
                 * @type {object}
                 * @property {string} [reason] - The reason of the hangup (e.g. ICE failed)
                 */
                this.emit(protocol_js_1.JANODE.EVENT.HANDLE_HANGUP, janode_event_data);
                break;
            }
            /* Media event: a/v media reception from Janus */
            /* In this case the janus message has "type" and "receiving" fields */
            case protocol_js_1.JANUS.EVENT.MEDIA: {
                if (typeof janus_message.type !== 'undefined')
                    janode_event_data.type = janus_message.type;
                if (typeof janus_message.receiving !== 'undefined')
                    janode_event_data.receiving = janus_message.receiving;
                if (typeof janus_message.mid !== 'undefined')
                    janode_event_data.mid = janus_message.mid;
                if (typeof janus_message.substream !== 'undefined')
                    janode_event_data.substream = janus_message.substream;
                if (typeof janus_message.seconds !== 'undefined')
                    janode_event_data.seconds = janus_message.seconds;
                /**
                 * The handle received a media notification.
                 *
                 * @event module:handle~Handle#event:HANDLE_MEDIA
                 * @type {object}
                 * @property {string} type - The kind of media (audio/video)
                 * @property {boolean} receiving - True if Janus is receiving media
                 * @property {string} [mid] - The involved mid
                 * @property {number} [substream] - The involved simulcast substream
                 * @property {number} [seconds] - Time, in seconds, with no media
                 */
                this.emit(protocol_js_1.JANODE.EVENT.HANDLE_MEDIA, janode_event_data);
                break;
            }
            /* Webrtcup event: peer connection is up */
            case protocol_js_1.JANUS.EVENT.WEBRTCUP: {
                /**
                 * The handle WebRTC connection is up.
                 *
                 * @event module:handle~Handle#event:HANDLE_WEBRTCUP
                 */
                this.emit(protocol_js_1.JANODE.EVENT.HANDLE_WEBRTCUP, janode_event_data);
                break;
            }
            /* Slowlink event: NACKs number increasing */
            /* In this case the janus message has "uplink" and "nacks" fields */
            case protocol_js_1.JANUS.EVENT.SLOWLINK: {
                if (typeof janus_message.uplink !== 'undefined')
                    janode_event_data.uplink = janus_message.uplink;
                if (typeof janus_message.mid !== 'undefined')
                    janode_event_data.mid = janus_message.mid;
                if (typeof janus_message.media !== 'undefined')
                    janode_event_data.media = janus_message.media;
                if (typeof janus_message.lost !== 'undefined')
                    janode_event_data.lost = janus_message.lost;
                /**
                 * The handle has received a slowlink notification.
                 *
                 * @event module:handle~Handle#event:HANDLE_SLOWLINK
                 * @type {object}
                 * @property {boolean} uplink - The direction of the slow link
                 * @property {string} media - The media kind (audio/video)
                 * @property {string} [mid] - The involved stream mid
                 * @property {number} lost - Number of missing packets in the last time slot
                 */
                this.emit(protocol_js_1.JANODE.EVENT.HANDLE_SLOWLINK, janode_event_data);
                break;
            }
            /* Trickle from Janus */
            case protocol_js_1.JANUS.EVENT.TRICKLE: {
                /**
                 * The handle has received a trickle notification.
                 *
                 * @event module:handle~Handle#event:HANDLE_TRICKLE
                 * @type {object}
                 * @property {boolean} [completed] - If true, this notifies the end of triclking (the other fields of the event are missing in this case)
                 * @property {string} [sdpMid] - The mid the candidate refers to
                 * @property {number} [sdpMLineIndex] - The m-line the candidate refers to
                 * @property {string} [candidate] - The candidate string
                 */
                const { completed, sdpMid, sdpMLineIndex, candidate } = janus_message.candidate;
                if (!completed) {
                    janode_event_data.sdpMid = sdpMid;
                    janode_event_data.sdpMLineIndex = sdpMLineIndex;
                    janode_event_data.candidate = candidate;
                }
                else {
                    janode_event_data.completed = true;
                }
                this.emit(protocol_js_1.JANODE.EVENT.HANDLE_TRICKLE, janode_event_data);
                break;
            }
            default:
                logger_js_1.default.error(`${LOG_NS} ${this.name} unknown janus event directed to the handle ${JSON.stringify(janus_message)}`);
        }
    }
    /**
     * Decorate request with handle id and transaction (if missing).
     *
     * @private
     * @param {object} request
     */
    _decorateRequest(request) {
        request.transaction = request.transaction || (0, utils_js_1.getNumericID)();
        request.handle_id = request.handle_id || this.id;
    }
    /**
     * Stub handleMessage (it is overriden by specific plugin handlers).
     * Implementations must return falsy values for unhandled events and truthy value
     * for handled events.
     *
     */
    handleMessage() {
        return null;
    }
    /**
     * Helper to check if the handle is managing a specific transaction.
     *
     * @property {string} id - The transaction id
     * @returns {boolean} True if this handle is the owner
     */
    ownsTransaction(id) {
        return this._tm.getTransactionOwner(id) === this;
    }
    /**
     * Helper to close a transaction with error.
     *
     * @property {string} id - The transaction id
     * @property {object} error - The error object
     * @returns {void}
     */
    closeTransactionWithError(id, error) {
        this._tm.closeTransactionWithError(id, this, error);
        return;
    }
    /**
     * Helper to close a transaction with success.
     *
     * @property {string} id - The transaction id
     * @property {object} [data] - The callback success data
     * @returns {void}
     */
    closeTransactionWithSuccess(id, data) {
        this._tm.closeTransactionWithSuccess(id, this, data);
        return;
    }
    /**
     * Send a request from this handle.
     *
     * @param {object} request
     * @returns {Promise<object>} A promsie resolving with the response to the request
     */
    sendRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            /* Input check */
            if (typeof request !== 'object' || !request) {
                const error = new Error('request must be an object');
                logger_js_1.default.error(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            /* Check handle status */
            if (this._detached) {
                const error = new Error('unable to send request because handle has been detached');
                logger_js_1.default.error(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            /* Add handle properties */
            this._decorateRequest(request);
            return new Promise((resolve, reject) => {
                /* Create a new transaction if the transaction does not exist */
                /* Use promise resolve and reject fn as callbacks for the transaction */
                this._tm.createTransaction(request.transaction, this, request.janus, resolve, reject);
                /* Send this message through the parent janode session */
                this.session.sendRequest(request).catch(error => {
                    /* In case of error quickly close the transaction */
                    this.closeTransactionWithError(request.transaction, error);
                });
            });
        });
    }
    /**
     * Gracefully detach the Handle.
     *
     * @returns {Promise<void>}
     */
    detach() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._detaching) {
                const error = new Error('detaching already in progress');
                logger_js_1.default.verbose(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            if (this._detached) {
                const error = new Error('already detached');
                logger_js_1.default.verbose(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            logger_js_1.default.info(`${LOG_NS} ${this.name} detaching handle`);
            this._detaching = true;
            const request = {
                janus: protocol_js_1.JANUS.REQUEST.DETACH_PLUGIN,
            };
            try {
                yield this.sendRequest(request);
                this._signalDetach();
                return;
            }
            catch ({ message }) {
                this._detaching = false;
                logger_js_1.default.error(`${LOG_NS} ${this.name} error while detaching (${message})`);
            }
        });
    }
    /**
     * Close the peer connection associated to this handle.
     *
     * @returns {Promise<object>}
     */
    hangup() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                janus: protocol_js_1.JANUS.REQUEST.HANGUP,
            };
            try {
                return this.sendRequest(request);
            }
            catch (error) {
                logger_js_1.default.error(`${LOG_NS} ${this.name} error while hanging up (${error.message})`);
                throw error;
            }
        });
    }
    /**
     * Send an ICE candidate / array of candidates.
     *
     * @param {RTCIceCandidate|RTCIceCandidate[]} candidate
     * @returns {Promise<void>}
     */
    trickle(candidate) {
        return __awaiter(this, void 0, void 0, function* () {
            /* If candidate is null or undefined, send an ICE trickle complete message */
            if (!candidate)
                return this.trickleComplete();
            /* Input checking */
            if (typeof candidate !== 'object') {
                const error = new Error('invalid candidate object');
                logger_js_1.default.error(`${LOG_NS} ${this.name} ${error.message}`);
                throw error;
            }
            const request = {
                janus: protocol_js_1.JANUS.REQUEST.TRICKLE
            };
            /* WATCH OUT ! In case of an array, the field is name "candidates" */
            if (Array.isArray(candidate)) {
                request.candidates = candidate;
            }
            else {
                request.candidate = candidate;
            }
            try {
                return this.sendRequest(request);
            }
            catch (error) {
                logger_js_1.default.error(`${LOG_NS} ${this.name} error on trickle (${error.message})`);
                throw error;
            }
        });
    }
    /**
     * Send ICE trickle complete message.
     *
     * @returns {Promise<void>}
     */
    trickleComplete() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.trickle({
                completed: true
            });
        });
    }
    /**
     * Send a `message` to Janus from this handle, with given body and optional jsep.
     *
     * @param {object} body - The body of the message
     * @param {RTCSessionDescription} [jsep]
     * @returns {Promise<object>} A promise resolving with the response to the message
     *
     * @example
     * // This is a plugin that sends a message with a custom body
     * const body = {
     *   audio: true,
     *   video: true,
     *   record: false,
     * };
     *
     * await handle.message(body, jsep);
     *
     */
    message(body, jsep) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                janus: protocol_js_1.JANUS.REQUEST.MESSAGE,
                body,
            };
            if (jsep)
                request.jsep = jsep;
            try {
                return this.sendRequest(request);
            }
            catch (error) {
                logger_js_1.default.error(`${LOG_NS} ${this.name} error on message (${error.message})`);
                throw error;
            }
        });
    }
}
exports.default = Handle;
