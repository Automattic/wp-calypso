export const fromApi = ( { data: { max_lock_period, timeout } } ) => ( {
	expires: new Date().getTime() + timeout * 1000,
	maxLockPeriod: max_lock_period * 1000,
} );
