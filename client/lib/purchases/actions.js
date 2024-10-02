import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';
import { getCancelPurchaseSurveyTakenPreferenceKey } from 'calypso/me/purchases/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';

const debug = debugFactory( 'calypso:purchases:actions' );

export function cancelPurchase( purchaseId, onComplete ) {
	wpcom.req.post( `/upgrades/${ purchaseId }/disable-auto-renew`, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		onComplete( success );
	} );
}

export function cancelAndRefundPurchase( purchaseId, data, onComplete ) {
	wpcom.req.post(
		{
			path: `/purchases/${ purchaseId }/cancel`,
			body: data,
			apiNamespace: 'wpcom/v2',
		},
		onComplete
	);
}

export async function cancelPurchaseAsync( purchaseId ) {
	try {
		const data = await wpcom.req.post( `/upgrades/${ purchaseId }/disable-auto-renew` );
		debug( null, data );
		return data.success;
	} catch ( error ) {
		debug( error, null );
		return false;
	}
}

export async function cancelAndRefundPurchaseAsync( purchaseId, data ) {
	return wpcom.req.post( {
		path: `/purchases/${ purchaseId }/cancel`,
		body: data,
		apiNamespace: 'wpcom/v2',
	} );
}

export const submitSurvey = ( surveyName, siteId, surveyData ) => ( dispatch ) => {
	return wpcom.req
		.post( '/marketing/survey', {
			survey_id: surveyName,
			site_id: siteId,
			survey_responses: surveyData,
		} )
		.then( ( res ) => {
			debug( 'Survey submit response', res );
			if ( ! res.success ) {
				dispatch( errorNotice( res.err ) );
			}
		} )
		.catch( ( err ) => debug( err ) ); // shouldn't get here
};

export const cancelPurchaseSurveyTaken = ( purchaseId ) => ( dispatch ) => {
	savePreference( getCancelPurchaseSurveyTakenPreferenceKey( purchaseId ), true )( dispatch );
};

export function disableAutoRenew( purchaseId, onComplete ) {
	wpcom.req.post( `/upgrades/${ purchaseId }/disable-auto-renew`, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		onComplete( success );
	} );
}

export function enableAutoRenew( purchaseId, onComplete ) {
	wpcom.req.post( `/upgrades/${ purchaseId }/enable-auto-renew`, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		onComplete( success );
	} );
}

export function extendPurchaseWithFreeMonth( purchaseId ) {
	return wpcom.req.post( {
		path: `/purchases/${ purchaseId }/extend`,
		apiNamespace: 'wpcom/v2',
	} );
}
