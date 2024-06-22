declare const _default: object;
export default _default;
/**
 * The payload of the plugin message (cfr. Janus docs).
 * {@link https://janus.conf.meetecho.com/docs/videoroom.html}
 */
export type VideoRoomData = object;
/**
 * The response event when a publisher has joined.
 */
export type VIDEOROOM_EVENT_PUB_JOINED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed identifier
     */
    feed: number | string;
    /**
     * - The dsplay name, if available
     */
    display?: string | undefined;
    /**
     * - A description of the room, if available
     */
    description: string;
    /**
     * - The private id that can be used when subscribing
     */
    private_id: number;
    /**
     * - The list of active publishers
     */
    publishers: {
        feed: number | string;
        display?: string;
        talking?: boolean;
        audiocodec?: string;
        videocodec?: string;
        simulcast: boolean;
        streams?: object[];
    };
    /**
     * - True if the stream is end-to-end encrypted
     */
    e2ee?: boolean | undefined;
    /**
     * - The JSEP answer
     */
    jsep?: RTCSessionDescription | undefined;
};
/**
 * The response event when a subscriber has joined.
 */
export type VIDEOROOM_EVENT_SUB_JOINED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The published feed identifier
     */
    feed?: string | number | undefined;
    /**
     * - The published feed display name
     */
    display?: string | undefined;
    /**
     * - [multistream] Streams description as returned by Janus
     */
    streams?: object[] | undefined;
};
/**
 * The response event to a participant list request.
 */
export type VIDEOROOM_EVENT_PARTICIPANTS_LIST = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The current published feed
     */
    feed: number | string;
    /**
     * - The list of current participants
     */
    participants: {
        feed: number | string;
        display?: string;
        publisher: boolean;
        talking?: boolean;
    };
};
/**
 * The response event for room create request.
 */
export type VIDEOROOM_EVENT_CREATED = {
    /**
     * - The created room
     */
    room: number | string;
    /**
     * - True if the room has been persisted on the Janus configuratin file
     */
    permanent: boolean;
};
/**
 * The response event for room destroy request.
 */
export type VIDEOROOM_EVENT_DESTROYED = {
    /**
     * - The destroyed room
     */
    room: number | string;
    /**
     * - True if the room has been removed from the Janus configuratin file
     */
    permanent: boolean;
};
/**
 * The response event for room exists request.
 */
export type VIDEOROOM_EVENT_EXISTS = {
    /**
     * - The queried room
     */
    room: number | string;
};
/**
 * Descriptrion of an active RTP forwarder.
 */
export type RtpForwarder = {
    /**
     * - The target host
     */
    host: string;
    /**
     * - The RTP audio target port
     */
    audio_port?: number | undefined;
    /**
     * - The RTCP audio target port
     */
    audio_rtcp_port?: number | undefined;
    /**
     * - The audio forwarder identifier
     */
    audio_stream?: number | undefined;
    /**
     * - The RTP video target port
     */
    video_port?: number | undefined;
    /**
     * - The RTCP video target port
     */
    video_rtcp_port?: number | undefined;
    /**
     * - The video forwarder identifier
     */
    video_stream?: number | undefined;
    /**
     * - The RTP video target port (simulcast)
     */
    video_port_2?: number | undefined;
    /**
     * - The video forwarder identifier (simulcast)
     */
    video_stream_2?: number | undefined;
    /**
     * - The RTP video target port (simulcast)
     */
    video_port_3?: number | undefined;
    /**
     * - The video forwarder identifier (simulcast)
     */
    video_stream_3?: number | undefined;
    /**
     * - The datachannels target port
     */
    data_port?: number | undefined;
    /**
     * - The datachannels forwarder identifier
     */
    data_stream?: number | undefined;
    /**
     * - SSRC this forwarder is using
     */
    ssrc?: number | undefined;
    /**
     * - payload type this forwarder is using
     */
    pt?: number | undefined;
    /**
     * - video simulcast substream this video forwarder is relaying
     */
    sc_substream_layer?: number | undefined;
    /**
     * - whether the RTP stream is encrypted
     */
    srtp?: boolean | undefined;
};
/**
 * The response event for RTP forward start request.
 */
export type VIDEOROOM_EVENT_RTP_FWD_STARTED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The forwarder object
     */
    forwarder?: RtpForwarder | undefined;
    /**
     * - [multistream] The array of forwarders
     */
    forwarders?: RtpForwarder[] | undefined;
};
/**
 * The response event for RTP forward stop request.
 */
export type VIDEOROOM_EVENT_RTP_FWD_STOPPED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed identifier being forwarded
     */
    feed: number | string;
    /**
     * - The forwarder identifier
     */
    stream: number;
};
/**
 * The response event for RTP forwarders list request.
 */
export type VIDEOROOM_EVENT_RTP_FWD_LIST = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The list of forwarders
     */
    forwarders: {
        feed: number | string;
        forwarders: RtpForwarder[];
    };
};
/**
 * The response event for videoroom list request.
 */
export type VIDEOROOM_EVENT_LIST = {
    /**
     * - The list of the room as returned by Janus
     */
    list: object[];
};
/**
 * The response event for ACL tokens edit (allowed) request.
 */
export type VIDEOROOM_EVENT_ALLOWED = {
    /**
     * - The updated, complete, list of allowed tokens
     */
    list: string[];
};
/**
 * The response event for publisher/subscriber configure request.
 */
export type VIDEOROOM_EVENT_CONFIGURED = {
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
     * - True if the request had it true
     */
    restart?: boolean | undefined;
    /**
     * - True if the request had it true
     */
    update?: boolean | undefined;
    /**
     * - A string with the value returned by Janus
     */
    configured: string;
    /**
     * - [multistream] Streams description as returned by Janus
     */
    streams?: object[] | undefined;
    /**
     * - True if the stream is end-to-end encrypted
     */
    e2ee?: boolean | undefined;
    /**
     * - The JSEP answer
     */
    jsep?: RTCSessionDescription | undefined;
};
/**
 * The response event for subscriber start request.
 */
export type VIDEOROOM_EVENT_STARTED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that started
     */
    feed?: string | number | undefined;
    /**
     * - True if started stream is e2ee
     */
    e2ee?: boolean | undefined;
    /**
     * - A string with the value returned by Janus
     */
    started: string;
};
/**
 * The response event for subscriber pause request.
 */
export type VIDEOROOM_EVENT_PAUSED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that has been paused
     */
    feed: number | string;
    /**
     * - A string with the value returned by Janus
     */
    paused: string;
};
/**
 * The response event for subscriber switch request.
 */
export type VIDEOROOM_EVENT_SWITCHED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that has been switched from
     */
    from_feed?: string | number | undefined;
    /**
     * - The feed that has been switched to
     */
    to_feed?: string | number | undefined;
    /**
     * - A string with the value returned by Janus
     */
    switched: string;
    /**
     * - The display name of the new feed
     */
    display?: string | undefined;
    /**
     * - [multistream] The updated streams array
     */
    streams?: object[] | undefined;
};
/**
 * The response event for publisher unpublish request.
 */
export type VIDEOROOM_EVENT_UNPUBLISHED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that unpublished
     */
    feed: number | string;
};
/**
 * The response event for publiher/subscriber leave request.
 */
export type VIDEOROOM_EVENT_LEAVING = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that left
     */
    feed: number | string;
    /**
     * - An optional string with the reason of the leaving
     */
    reason?: string | undefined;
};
/**
 * The response event for the kick request.
 */
export type VIDEOROOM_EVENT_KICKED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The feed that has been kicked
     */
    feed: number | string;
};
/**
 * The response event for the recording enabled request.
 */
export type VIDEOROOM_EVENT_RECORDING_ENABLED_STATE = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - Whether or not the room recording is now enabled
     */
    recording: boolean;
};
/**
 * [multistream] The response event for update subscriber request.
 */
export type VIDEOROOM_EVENT_UPDATED = {
    /**
     * - The involved room
     */
    room: number | string;
    /**
     * - The updated JSEP offer
     */
    jsep?: RTCSessionDescription | undefined;
    /**
     * - List of the updated streams in this subscription
     */
    streams: object[];
};
