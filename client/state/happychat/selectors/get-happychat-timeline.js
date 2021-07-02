/**
 * Gets timeline chat events from the happychat state
 *
 * @param {object} state - Global redux state
 * @returns [{object}] events - an array of timeline chat events
 */
export default ( state ) => state.happychat.chat.timeline;
