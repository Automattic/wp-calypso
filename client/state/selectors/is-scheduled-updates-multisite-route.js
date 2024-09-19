import getCurrentRoute from 'calypso/state/selectors/get-current-route';

export function isScheduledUpdatesMultisiteBaseRoute( state ) {
	const route = getCurrentRoute( state );

	if ( ! route ) {
		return false;
	}

	const RGX = /^\/plugins\/scheduled-updates\/?$/;

	return RGX.test( route );
}

export function isScheduledUpdatesMultisiteCreateRoute( state ) {
	const route = getCurrentRoute( state );

	if ( ! route ) {
		return false;
	}

	const RGX = /^\/plugins\/scheduled-updates\/create\/?$/;

	return RGX.test( route );
}

export function isScheduledUpdatesMultisiteEditRoute( state ) {
	const route = getCurrentRoute( state );

	if ( ! route ) {
		return false;
	}

	const RGX = /^\/plugins\/scheduled-updates\/edit\/[a-f0-9]+-(daily|weekly)-\d+-\d{2}:\d{2}\/?$/;

	return RGX.test( route );
}

/**
 * Returns true if the current route is a scheduled updates multisite route.
 * @param {Object} state Global state tree
 * @returns {boolean}
 */
export default function isScheduledUpdatesMultisiteRoute( state ) {
	const route = getCurrentRoute( state );

	if ( ! route ) {
		return false;
	}

	return (
		isScheduledUpdatesMultisiteBaseRoute( state ) ||
		isScheduledUpdatesMultisiteCreateRoute( state ) ||
		isScheduledUpdatesMultisiteEditRoute( state )
	);
}
