// These CONNECTION_ERROR constants come directly from the Socket.IO client library.
// These are the possible reasons for a connection disconnect.
export const HAPPYCHAT_CONNECTION_ERROR_FORCED_CLOSE = 'forced close';
export const HAPPYCHAT_CONNECTION_ERROR_PING_TIMEOUT = 'ping timeout';
export const HAPPYCHAT_CONNECTION_ERROR_TRANSPORT_CLOSE = 'transport close';
export const HAPPYCHAT_CONNECTION_ERROR_TRANSPORT_ERROR = 'transport error';

// Max number of messages to save between refreshes
export const HAPPYCHAT_MAX_STORED_MESSAGES = 30;
