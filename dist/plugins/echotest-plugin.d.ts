declare const _default: object;
export default _default;
/**
 * The payload of the plugin message (cfr. Janus docs).
 * {@link https://janus.conf.meetecho.com/docs/echotest.html}
 */
export type EchoTestData = object;
export type ECHOTEST_EVENT_RESULT = {
    /**
     * - The result status (ok, done ...)
     */
    result: string;
    /**
     * - The answer from Janus
     */
    jsep?: RTCSessionDescription | undefined;
};
