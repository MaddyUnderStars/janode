'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAckData = exports.isTimeoutData = exports.isErrorData = exports.isEventData = exports.isResponseData = exports.JANODE = exports.JANUS = void 0;
/**
 * This module contains several Janus constants related to the Janus/Admin API and Janode, like:<br>
 *
 * - Janus request names<br>
 *
 * - Janus response names<br>
 *
 * - Janus event names<br>
 *
 * - Janode event names<br>
 *
 * Some helper methods related to the protocols are defined here too.
 * @module protocol
 * @private
 */
/**
 * Janus protocol constants
 *
 * @private
 */
exports.JANUS = {
    /**
     * Janus API requests
     */
    REQUEST: {
        /* connection level requests */
        SERVER_INFO: 'info',
        /* session level requests */
        CREATE_SESSION: 'create',
        KEEPALIVE: 'keepalive',
        DESTROY_SESSION: 'destroy',
        /* handle level requests */
        ATTACH_PLUGIN: 'attach',
        MESSAGE: 'message',
        TRICKLE: 'trickle',
        HANGUP: 'hangup',
        DETACH_PLUGIN: 'detach',
    },
    /**
     * Janus temporary response (ack)
     */
    ACK: 'ack',
    /**
     * Janus definitive responses
     */
    RESPONSE: {
        SUCCESS: 'success',
        SERVER_INFO: 'server_info',
        ERROR: 'error',
    },
    /**
     * Janus events
     */
    EVENT: {
        EVENT: 'event',
        DETACHED: 'detached',
        ICE_FAILED: 'ice-failed',
        HANGUP: 'hangup',
        MEDIA: 'media',
        TIMEOUT: 'timeout',
        WEBRTCUP: 'webrtcup',
        SLOWLINK: 'slowlink',
        TRICKLE: 'trickle',
    },
    /**
     * Janus Admin API requests
     */
    ADMIN: {
        LIST_SESSIONS: 'list_sessions',
        LIST_HANDLES: 'list_handles',
        HANDLE_INFO: 'handle_info',
        START_PCAP: 'start_pcap',
        STOP_PCAP: 'stop_pcap',
    },
};
/**
 * Janode protocol constants
 *
 * @private
 */
exports.JANODE = {
    /**
     * Janode core events.
     */
    EVENT: {
        CONNECTION_CLOSED: 'connection_closed',
        SESSION_DESTROYED: 'session_destroyed',
        HANDLE_DETACHED: 'handle_detached',
        HANDLE_ICE_FAILED: 'handle_ice_failed',
        HANDLE_HANGUP: 'handle_hangup',
        HANDLE_MEDIA: 'handle_media',
        HANDLE_WEBRTCUP: 'handle_webrtcup',
        HANDLE_SLOWLINK: 'handle_slowlink',
        HANDLE_TRICKLE: 'handle_trickle',
        CONNECTION_ERROR: 'connection_error',
    },
};
/**
 * Check if a message from Janus is a definitive response.
 *
 * @private
 * @param {object} data - The data from Janus
 * @returns {boolean} True if the check succeeds
 */
const isResponseData = data => {
    if (typeof data === 'object' && data) {
        return Object.values(exports.JANUS.RESPONSE).includes(data.janus);
    }
    return false;
};
exports.isResponseData = isResponseData;
/**
 * Check if a message from Janus is an event.
 *
 * @private
 * @param {object} data - The data from Janus
 * @returns {boolean} True if the check succeeds
 */
const isEventData = data => {
    if (typeof data === 'object' && data) {
        return data.janus === exports.JANUS.EVENT.EVENT;
    }
    return false;
};
exports.isEventData = isEventData;
/**
 * Check if a message from Janus is an error.
 *
 * @private
 * @param {object} data - The data from Janus
 * @returns {boolean} True if the check succeeds
 */
const isErrorData = data => {
    if (typeof data === 'object' && data) {
        return data.janus === exports.JANUS.RESPONSE.ERROR;
    }
    return false;
};
exports.isErrorData = isErrorData;
/**
 * Check if a message from Janus is a timeout notification.
 *
 * @private
 * @param {object} data - The data from Janus
 * @returns {boolean} True if the check succeeds
 */
const isTimeoutData = data => {
    if (typeof data === 'object' && data) {
        return data.janus === exports.JANUS.EVENT.TIMEOUT;
    }
    return false;
};
exports.isTimeoutData = isTimeoutData;
/**
 * Check if a message from Janus is an ack.
 *
 * @private
 * @param {object} data - The data from Janus
 * @returns {boolean} True if the check succeeds
 */
const isAckData = data => {
    if (typeof data === 'object' && data) {
        return data.janus === exports.JANUS.ACK;
    }
    return false;
};
exports.isAckData = isAckData;
