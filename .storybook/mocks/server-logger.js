// `calypso/server/lib/logger` wraps bunyan, which needs Node built-ins (`stream`, `fs`). Browser
// code only reaches it through `calypso/lib/explat` (imported by the dashboard routes), so stories
// get a no-op logger instead.
const noop = () => {};
const logger = { error: noop, warn: noop, info: noop, debug: noop, trace: noop };

export const getLogger = () => logger;
