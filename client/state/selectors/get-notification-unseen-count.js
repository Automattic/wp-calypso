export default ( state ) =>
	undefined === state.notificationsUnseenCount ? null : state.notificationsUnseenCount;
