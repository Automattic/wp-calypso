/**
 * Internal dependencies
 */
import 'calypso/state/notifications/init';

export default ( state ) =>
	undefined === state.notificationsUnseenCount ? null : state.notificationsUnseenCount;
