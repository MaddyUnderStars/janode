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
 * This module contains the implementation of the EchoTest plugin (ref. {@link https://janus.conf.meetecho.com/docs/echotest.html}).
 * @module echotest-plugin
 */
const handle_js_1 = __importDefault(require("../handle.js"));
/* The plugin ID exported in the plugin descriptor */
const PLUGIN_ID = 'janus.plugin.echotest';
/* These are the events/responses that the Janode plugin will manage */
/* Some of them will be exported in the plugin descriptor */
const PLUGIN_EVENT = {
    SLOWLINK: 'echotest_slowlink',
    RESULT: 'echotest_result',
    ERROR: 'echotest_error',
};
/**
 * The class implementing the EchoTest plugin (ref. {@link https://janus.conf.meetecho.com/docs/echotest.html}).<br>
 *
 * It extends the base Janode Handle class and overrides the base "handleMessage" method.<br>
 *
 * Moreover it defines some methods to support EchoTest operations.<br>
 *
 * @hideconstructor
 */
class EchoTestHandle extends handle_js_1.default {
    /**
     * Create a Janode EchoTest handle.
     *
     * @param {module:session~Session} session - A reference to the parent session
     * @param {number} id - The handle identifier
     */
    constructor(session, id) {
        super(session, id);
    }
    /**
     * The custom "handleMessage" needed for handling EchoTest messages.
     *
     * @private
     * @param {object} janus_message
     * @returns {object} A falsy value for unhandled events, a truthy value for handled events
     */
    handleMessage(janus_message) {
        const { plugindata, jsep, transaction } = janus_message;
        if (plugindata && plugindata.data && plugindata.data.echotest) {
            /**
             * @type {EchoTestData}
             */
            const message_data = plugindata.data;
            const { echotest, event, error, error_code, result } = message_data;
            /* Prepare an object for the output Janode event */
            const janode_event = {
                /* The name of the resolved event */
                event: null,
                /* The event payload */
                data: {},
            };
            /* Add JSEP data if available */
            if (jsep)
                janode_event.data.jsep = jsep;
            /* The plugin will emit an event only if the handle does not own the transaction */
            /* That means that a transaction has already been closed or this is an async event */
            const emit = (this.ownsTransaction(transaction) === false);
            /* Use the "janode" property to store the output event */
            janus_message._janode = janode_event;
            switch (echotest) {
                /* Generic event (e.g. result, error) */
                case 'event':
                    /* EchoTest SlowLink event */
                    if (event === 'slow_link') {
                        janode_event.event = PLUGIN_EVENT.SLOWLINK;
                        janode_event.data.bitrate = message_data['current-bitrate'];
                        break;
                    }
                    /* EchoTest Result event (ok, done ...)  */
                    if (result) {
                        janode_event.event = PLUGIN_EVENT.RESULT;
                        janode_event.data.result = result;
                        break;
                    }
                    /* EchoTest error */
                    if (error) {
                        janode_event.event = PLUGIN_EVENT.ERROR;
                        janode_event.data = new Error(`${error_code} ${error}`);
                        /* In case of error, close a transaction */
                        this.closeTransactionWithError(transaction, janode_event.data);
                        break;
                    }
                    break;
            }
            /* The event has been handled */
            if (janode_event.event) {
                /* Try to close the transaction */
                this.closeTransactionWithSuccess(transaction, janus_message);
                /* If the transaction was not owned, emit the event */
                if (emit)
                    this.emit(janode_event.event, janode_event.data);
                return janode_event;
            }
        }
        /* The event has not been handled, return a falsy value */
        return null;
    }
    /**
     * Start/update an echotest session.
     *
     * @param {object} params
     * @param {boolean} [params.audio] - True to request audio in this session
     * @param {boolean} [params.video] - True to request video in this session
     * @param {RTCSessionDescription} [params.jsep=null] - The JSEP offer
     * @param {number} [params.bitrate=0] - The bitrate to force in the session
     * @param {boolean} [params.record=false] - True to record the session
     * @param {string} [params.filename=null]  - The filename of the recording
     * @returns {Promise<module:echotest-plugin~ECHOTEST_EVENT_RESULT>}
     */
    start({ audio, video, jsep = null, bitrate = 0, record = false, filename = null }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof jsep === 'object' && jsep.type !== 'offer') {
                const error = new Error('jsep must be an offer');
                return Promise.reject(error);
            }
            const body = {
                audio: (typeof audio === 'boolean') ? audio : false,
                video: (typeof video === 'boolean') ? video : false,
                record: (typeof record === 'boolean') ? record : false,
            };
            if (typeof bitrate === 'number')
                body.bitrate = bitrate;
            if (typeof filename === 'string')
                body.filename = filename;
            const response = yield this.message(body, jsep);
            const { event, data: evtdata } = response._janode || {};
            if (event === PLUGIN_EVENT.RESULT && evtdata.result === 'ok')
                return evtdata;
            const error = new Error('invalid echotest result');
            throw (error);
        });
    }
}
/**
 * The payload of the plugin message (cfr. Janus docs).
 * {@link https://janus.conf.meetecho.com/docs/echotest.html}
 *
 * @private
 * @typedef {object} EchoTestData
 */
/**
 * @typedef {object} ECHOTEST_EVENT_RESULT
 * @property {string} result - The result status (ok, done ...)
 * @property {RTCSessionDescription} [jsep] - The answer from Janus
 */
/**
 * The exported plugin descriptor.
 *
 * @type {object}
 * @property {string} id - The plugin identifier used when attaching to Janus
 * @property {module:echotest-plugin~EchoTestHandle} Handle - The custom class implementing the plugin
 * @property {object} EVENT - The events emitted by the plugin
 * @property {string} EVENT.ECHOTEST_RESULT {@link module:echotest-plugin~ECHOTEST_RESULT}
 * @property {string} EVENT.ECHOTEST_SLOWLINK {@link module:echotest-plugin~ECHOTEST_SLOWLINK}
 * @property {string} EVENT.ECHOTEST_ERROR {@link module:echotest-plugin~ECHOTEST_ERROR}
 */
exports.default = {
    id: PLUGIN_ID,
    Handle: EchoTestHandle,
    EVENT: {
        /**
         * @event module:echotest-plugin~EchoTestHandle#event:ECHOTEST_RESULT
         * @type {module:echotest-plugin~ECHOTEST_EVENT_RESULT}
         */
        ECHOTEST_RESULT: PLUGIN_EVENT.RESULT,
        /**
         * @event module:echotest-plugin~EchoTestHandle#event:ECHOTEST_SLOWLINK
         * @type {object}
         * @property {number} bitrate
         */
        ECHOTEST_SLOWLINK: PLUGIN_EVENT.SLOWLINK,
        /**
         * @event module:echotest-plugin~EchoTestHandle#event:ECHOTEST_ERROR
         * @type {Error}
         */
        ECHOTEST_ERROR: PLUGIN_EVENT.ERROR,
    },
};
