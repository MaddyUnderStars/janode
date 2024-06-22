declare const _default: object;
export default _default;
/**
 * The payload of the plugin message (cfr. Janus docs).
 * {@link https://janus.conf.meetecho.com/docs/streaming.html}
 */
export type StreamingData = object;
/**
 * Success response for streaming requests.
 */
export type STREAMING_EVENT_OK = object;
/**
 * Response event for mountpoint info request.
 */
export type STREAMING_EVENT_INFO = object;
/**
 * Response event for mountpoint list request.
 */
export type STREAMING_EVENT_LIST = {
    /**
     * - The list of mountpoints as returned by Janus
     */
    list: object[];
};
/**
 * Response event for mountpoint create request.
 */
export type STREAMING_EVENT_CREATED = {
    /**
     * - The name of the mountpoint
     */
    name: string;
    /**
     * - The identifier for the mountpoint
     */
    id: number | string;
    /**
     * - An optional description
     */
    description: string;
    /**
     * - The port for RTP audio
     */
    audio_port?: number | undefined;
    /**
     * - The port RTCP audio
     */
    audio_rtcp_port?: number | undefined;
    /**
     * - The port for RTP video
     */
    video_port?: number | undefined;
    /**
     * - The port for RTP video (simulcast)
     */
    video_port_2?: number | undefined;
    /**
     * - The port for RTP video (simulcast)
     */
    video_port_3?: number | undefined;
    /**
     * - The port for RTCP video
     */
    video_rtcp_port?: number | undefined;
    /**
     * - The port for datachannels
     */
    data_port?: number | undefined;
};
/**
 * Response event for mountpoint destroy request.
 */
export type STREAMING_EVENT_DESTROYED = {
    /**
     * - The identifier of the dstroyed mountpoint
     */
    id: number | string;
};
/**
 * A streaming status update event.
 */
export type STREAMING_EVENT_STATUS = {
    /**
     * - The current status of the stream
     */
    status: string;
    /**
     * - The involved mountpoint identifier
     */
    id?: string | number | undefined;
    /**
     * - True if the request had it true
     */
    restart?: boolean | undefined;
    /**
     * - True if an offered stream is end to end encrypted
     */
    e2ee?: boolean | undefined;
    /**
     * - Optional JSEP offer from Janus
     */
    jsep?: RTCSessionDescription | undefined;
};
/**
 * Response event for mountpoint switch request.
 */
export type STREAMING_EVENT_SWITCHED = {
    /**
     * - The string as returned by Janus
     */
    switched: string;
    /**
     * - The identifier of the mp that has been switched to
     */
    id: number | string;
};
/**
 * Response event for configure stream request
 */
export type STREAMING_EVENT_CONFIGURED = object;
