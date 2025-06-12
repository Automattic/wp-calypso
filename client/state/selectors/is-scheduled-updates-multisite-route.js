export function isScheduledUpdatesMultisiteBaseRoute( route ) {
	if ( ! route ) {
		return false;
	}

	const RGX = /^\/plugins\/scheduled-updates\/?$/;

	return RGX.test( route );
}

export function isScheduledUpdatesMultisiteCreateRoute( route ) {
	if ( ! route ) {
		return false;
	}

	const RGX = /^\/plugins\/scheduled-updates\/create\/?$/;

	return RGX.test( route );
}

export function isScheduledUpdatesMultisiteEditRoute( route ) {
	if ( ! route ) {
		return false;
	}

	const RGX = /^\/plugins\/scheduled-updates\/edit\/[a-f0-9]+-(daily|weekly)-\d+-\d{2}:\d{2}\/?$/;

	return RGX.test( route );
}

/**
 * Returns true if the current route is a scheduled updates multisite route.
 * @param {string} route Current route
 * @returns {boolean}
 */
export default function isScheduledUpdatesMultisiteRoute( route ) {
	if ( ! route ) {
		return false;
	}

	return (
		isScheduledUpdatesMultisiteBaseRoute( route ) ||
		isScheduledUpdatesMultisiteCreateRoute( route ) ||
		isScheduledUpdatesMultisiteEditRoute( route )
	);
}
