export namespace JANUS {
    namespace REQUEST {
        let SERVER_INFO: string;
        let CREATE_SESSION: string;
        let KEEPALIVE: string;
        let DESTROY_SESSION: string;
        let ATTACH_PLUGIN: string;
        let MESSAGE: string;
        let TRICKLE: string;
        let HANGUP: string;
        let DETACH_PLUGIN: string;
    }
    let ACK: string;
    namespace RESPONSE {
        export let SUCCESS: string;
        let SERVER_INFO_1: string;
        export { SERVER_INFO_1 as SERVER_INFO };
        export let ERROR: string;
    }
    namespace EVENT {
        let EVENT_1: string;
        export { EVENT_1 as EVENT };
        export let DETACHED: string;
        export let ICE_FAILED: string;
        let HANGUP_1: string;
        export { HANGUP_1 as HANGUP };
        export let MEDIA: string;
        export let TIMEOUT: string;
        export let WEBRTCUP: string;
        export let SLOWLINK: string;
        let TRICKLE_1: string;
        export { TRICKLE_1 as TRICKLE };
    }
    namespace ADMIN {
        let LIST_SESSIONS: string;
        let LIST_HANDLES: string;
        let HANDLE_INFO: string;
        let START_PCAP: string;
        let STOP_PCAP: string;
    }
}
export namespace JANODE {
    export namespace EVENT_2 {
        let CONNECTION_CLOSED: string;
        let SESSION_DESTROYED: string;
        let HANDLE_DETACHED: string;
        let HANDLE_ICE_FAILED: string;
        let HANDLE_HANGUP: string;
        let HANDLE_MEDIA: string;
        let HANDLE_WEBRTCUP: string;
        let HANDLE_SLOWLINK: string;
        let HANDLE_TRICKLE: string;
        let CONNECTION_ERROR: string;
    }
    export { EVENT_2 as EVENT };
}
export function isResponseData(data: object): boolean;
export function isEventData(data: object): boolean;
export function isErrorData(data: object): boolean;
export function isTimeoutData(data: object): boolean;
export function isAckData(data: object): boolean;
