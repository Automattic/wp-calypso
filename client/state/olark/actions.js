/**
 * Internal dependencies
 */
import olarkApi from 'lib/olark-api';
import {
	OLARK_DETAILS,
	OLARK_LOCALE,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_READY,
	OLARK_SET_EXPANDED,
	OLARK_USER_ELIGIBILITY
} from 'state/action-types';

export function setOlarkUserEligibility( isUserEligible ) {
	return dispatch => dispatch( { type: OLARK_USER_ELIGIBILITY, isUserEligible } );
}

export function setOlarkLocale( locale ) {
	return dispatch => dispatch( { type: OLARK_LOCALE, locale } );
}

export function setOlarkReady() {
	return dispatch => dispatch( { type: OLARK_READY } );
}

export function setOlarkOperatorsAvailable() {
	return dispatch => dispatch( { type: OLARK_OPERATORS_AVAILABLE } );
}

export function setOlarkOperatorsAway() {
	return dispatch => dispatch( { type: OLARK_OPERATORS_AWAY } );
}

export function setOlarkExpanded( isOlarkExpanded ) {
	return dispatch => dispatch( { type: OLARK_SET_EXPANDED, isOlarkExpanded } );
}

export function updateOlarkDetails() {
	return dispatch => {
		olarkApi( 'api.visitor.getDetails', details => dispatch( { type: OLARK_DETAILS, details } ) );
	};
}

export function sendOlarkNotificationToVisitor( body ) {
	olarkApi( 'api.chat.sendNotificationToVisitor', { body } );
}

export function sendOlarkNotificationToOperator( body ) {
	olarkApi( 'api.chat.sendNotificationToOperator', { body } );
}

export function expandOlarkBox() {
	olarkApi( 'api.box.expand' );
}

export function shrinkOlarkBox() {
	olarkApi( 'api.box.shrink' );
}

export function hideOlarkBox() {
	olarkApi( 'api.box.hide' );
}
