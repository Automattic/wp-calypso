/**
 * External dependencies
 */
import dispatcher from 'dispatcher';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/olark-store/constants';

/**
 * Module variables
 */
const olarkActions = {
	setUserEligibility( isUserEligible ) {
		dispatcher.handleServerAction( {
			isUserEligible,
			type: ActionTypes.OLARK_USER_ELIGIBILITY,
		} );
	},

	setLocale( locale ) {
		dispatcher.handleServerAction( {
			locale,
			type: ActionTypes.OLARK_LOCALE,
		} );
	},

	setReady() {
		dispatcher.handleServerAction( {
			type: ActionTypes.OLARK_READY
		} );
	},

	setOperatorsAvailable() {
		dispatcher.handleServerAction( {
			type: ActionTypes.OLARK_OPERATORS_AVAILABLE
		} );
	},

	setOperatorsAway() {
		dispatcher.handleServerAction( {
			type: ActionTypes.OLARK_OPERATORS_AWAY
		} );
	},

	setClosed( isSupportClosed ) {
		dispatcher.handleServerAction( {
			isSupportClosed,
			type: ActionTypes.OLARK_SET_CLOSED
		} );
	},

	setExpanded( isOlarkExpanded ) {
		dispatcher.handleServerAction( {
			isOlarkExpanded,
			type: ActionTypes.OLARK_SET_EXPANDED
		} );
	},

	updateDetails() {
		// Do nothing since olark is deprecated
	},

	sendNotificationToVisitor() {
		// Do nothing since olark is deprecated
	},

	sendNotificationToOperator() {
		// Do nothing since olark is deprecated
	},

	expandBox() {
		// Do nothing since olark is deprecated
	},

	shrinkBox() {
		// Do nothing since olark is deprecated
	},

	hideBox() {
		// Do nothing since olark is deprecated
	},

	focusBox() {
		// Do nothing since olark is deprecated
	}
};

export default olarkActions;

