export default Configuration;
/**
 * Class representing a Janode configuration.
 * The purpose of the class is basically filtering the input config and distinguish Janus API and Admin API connections.
 */
declare class Configuration {
    /**
     * Create a configuration.
     *
     * @private
     * @param {module:janode~RawConfiguration} config
     */
    private constructor();
    address: any[];
    retry_time_secs: number;
    max_retries: number;
    is_admin: boolean;
    ws_options: any;
    /**
     * Get the server list of this configuration.
     *
     * @returns {module:janode~ServerObjectConf[]} The address array
     */
    getAddress(): any;
    /**
     * Get the number of seconds between any attempt.
     *
     * @returns {number} The value of the property
     */
    getRetryTimeSeconds(): number;
    /**
     * Get the max number of retries.
     *
     * @returns {number} The value of the property
     */
    getMaxRetries(): number;
    /**
     * Check if the configuration is for an admin connection.
     *
     * @returns {boolean} True if the configuration will be used for an admin connection
     */
    isAdmin(): boolean;
    /**
     * Return the specific WebSocket transport options.
     *
     * @returns {object}
     */
    wsOptions(): object;
}
