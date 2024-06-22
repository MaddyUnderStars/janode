declare const _default: object;
export default _default;
/**
 * The payload of the plugin message (cfr. Janus docs).
 * {@link https://janus.conf.meetecho.com/docs/audiobridge.html}
 */
export type AudioBridgeData = object;
export type RtpParticipant = {
    /**
     * - IP address you want media to be sent to
     */
    ip: string;
    /**
     * - The port you want media to be sent to
     */
    port: number;
    /**
     * - The payload type to use for RTP packets
     */
    payload_type: number;
};
/**
 * The response event to a join request.
 */
export type AUDIOBRIDGE_EVENT_JOINED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed identifier
     */
    feed: number | string;
    /**
     * - The descriptor in case this is a plain RTP participant
     */
    rtp_participant?: any;
    /**
     * - The list of participants
     */
    participants: {
        feed: number | string;
        display?: string;
        muted?: boolean;
        setup?: boolean;
    };
};
/**
 * The response event for configure request.
 */
export type AUDIOBRIDGE_EVENT_CONFIGURED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed identifier
     */
    feed: number | string;
    /**
     * - The display name, if available
     */
    display?: string | undefined;
    /**
     * - The muted status
     */
    muted?: boolean | undefined;
    /**
     * - [0-10] Opus-related complexity to use
     */
    quality?: number | undefined;
    /**
     * - Volume percent value
     */
    volume?: number | undefined;
    /**
     * - True if recording is active for this feed
     */
    record?: boolean | undefined;
    /**
     * - The recording filename
     */
    filename?: string | undefined;
    /**
     * - Number of packets to buffer before decoding
     */
    prebuffer?: number | undefined;
    /**
     * - Group to assign to this participant
     */
    group?: string | undefined;
    /**
     * - The JSEP answer
     */
    jsep?: RTCSessionDescription | undefined;
};
/**
 * The response event for audiobridge hangup request.
 */
export type AUDIOBRIDGE_EVENT_AUDIO_HANGINGUP = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that is being hung up
     */
    feed: number | string;
};
/**
 * The response event for audiobridge leave request.
 */
export type AUDIOBRIDGE_EVENT_LEAVING = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * The feed that is leaving
     */
    "feed-": number | string;
};
/**
 * The response event for audiobridge participants list request.
 */
export type AUDIOBRIDGE_EVENT_PARTICIPANTS_LIST = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The list of participants
     */
    participants: {
        feed: number | string;
        display?: string;
        muted?: boolean;
        setup?: boolean;
        talking?: boolean;
        suspended?: boolean;
    };
};
/**
 * The response event for audiobridge participant kick request.
 */
export type AUDIOBRIDGE_EVENT_KICK_RESPONSE = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that has been kicked out
     */
    feed: number | string;
};
/**
 * The response event for audiobridge room exists request.
 */
export type AUDIOBRIDGE_EVENT_EXISTS = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - True if the rooms exists
     */
    exists: boolean;
};
/**
 * The response event for audiobridge room list request.
 */
export type AUDIOBRIDGE_EVENT_ROOMS_LIST = {
    /**
     * - The list of the rooms as returned by Janus
     */
    list: object[];
};
/**
 * The response event for audiobridge forwarder start request.
 */
export type AUDIOBRIDGE_EVENT_RTP_FWD = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - Forwarder descriptor
     */
    forwarder: {
        host: string;
        audio_port: number;
        audio_stream: number;
        group?: string | undefined;
    };
};
/**
 * The response event for audiobridge room create request.
 */
export type AUDIOBRIDGE_EVENT_CREATED = {
    /**
     * - The created room
     */
    room: number | string;
    /**
     * - True if the room is being persisted in the Janus config file
     */
    permanent: boolean;
};
/**
 * The response event for audiobridge room destroy request.
 */
export type AUDIOBRIDGE_EVENT_DESTROYED = {
    /**
     * - The destroyed room
     */
    room: number | string;
};
/**
 * The response event for audiobridge ACL token edit request.
 */
export type AUDIOBRIDGE_EVENT_RECORDING = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - Wheter recording is active or not
     */
    record: boolean;
};
/**
 * The response event for audiobridge forwarders list request.
 */
export type AUDIOBRIDGE_EVENT_FWD_LIST = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The list of forwarders
     */
    forwarders: {
        host: string;
        audio_port: number;
        audio_stream: number;
        always: boolean;
        group?: string;
    };
};
/**
 * The response event for audiobridge mute participant request.
 */
export type AUDIOBRIDGE_EVENT_MUTE_PARTICIPANT_RESPONSE = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The involved feed id
     */
    feed: number | string;
};
/**
 * The response event for audiobridge unmute participant request.
 */
export type AUDIOBRIDGE_EVENT_UNMUTE_PARTICIPANT_RESPONSE = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The involved feed id
     */
    feed: number | string;
};
/**
 * The response event for audiobridge mute room request.
 */
export type AUDIOBRIDGE_EVENT_MUTE_ROOM_RESPONSE = {
    /**
     * - The involved room
     */
    room: number | string;
};
/**
 * The response event for audiobridge unmute room request.
 */
export type AUDIOBRIDGE_EVENT_UNMUTE_ROOM_RESPONSE = {
    /**
     * - The involved room
     */
    room: number | string;
};
/**
 * The response event for audiobridge suspend request.
 */
export type AUDIOBRIDGE_EVENT_SUSPEND_RESPONSE = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The involved feed id
     */
    feed: number | string;
};
/**
 * The response event for audiobridge resume request.
 */
export type AUDIOBRIDGE_EVENT_RESUME_RESPONSE = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The involved feed id
     */
    feed: number | string;
};
/**
 * The response event for audiobridge ACL token edit request.
 */
export type AUDIOBRIDGE_EVENT_ALLOWED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The updated, complete, list of allowed tokens
     */
    list: string[];
};
