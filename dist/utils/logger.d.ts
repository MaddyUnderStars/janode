export default Logger;
declare namespace Logger {
    import verb = Logger.verbose;
    export { verb };
    import warn = Logger.warning;
    export { warn };
}
