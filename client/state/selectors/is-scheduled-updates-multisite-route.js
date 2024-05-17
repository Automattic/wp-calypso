import getCurrentRoute from 'calypso/state/selectors/get-current-route';

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

	const rgxMsBase = /^\/plugins\/scheduled-updates\/?$/;
	const rgxMsCreate = /^\/plugins\/scheduled-updates\/create\/?$/;
	const rgxMsEdit =
		/^\/plugins\/scheduled-updates\/edit\/[a-f0-9]+-(daily|weekly)-\d+-\d{2}:\d{2}\/?$/;

	return rgxMsBase.test( route ) || rgxMsCreate.test( route ) || rgxMsEdit.test( route );
}
