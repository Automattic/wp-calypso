/**
 * External dependencies
 */
import dispatcher from 'dispatcher';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from 'lib/olark-store/constants';
import olarkApi from 'lib/olark-api';

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
		olarkApi( 'api.visitor.getDetails', ( details ) => {
			dispatcher.handleServerAction( {
				details,
				type: ActionTypes.OLARK_DETAILS,
			} );
		} );
	},

	sendNotificationToVisitor( body ) {
		olarkApi( 'api.chat.sendNotificationToVisitor', { body } );
	},

	sendNotificationToOperator( body ) {
		olarkApi( 'api.chat.sendNotificationToOperator', { body } );
	},

	expandBox() {
		olarkApi( 'api.box.expand' );
	},

	shrinkBox() {
		olarkApi( 'api.box.shrink' );
	},

	hideBox() {
		olarkApi( 'api.box.hide' );
	},

	focusBox() {
		if ( ! document ) {
			return;
		}

		const chatInput = document.querySelector( '#habla_wcsend_input' );
		chatInput && chatInput.focus();
	}
};

export default olarkActions;

