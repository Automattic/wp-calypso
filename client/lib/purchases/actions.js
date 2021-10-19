import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

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

export const submitSurvey = ( surveyName, siteID, surveyData ) => ( dispatch ) => {
	const survey = wpcom.marketing().survey( surveyName, siteID );
	survey.addResponses( surveyData );

	debug( 'Survey responses', survey );
	return survey
		.submit()
		.then( ( res ) => {
			debug( 'Survey submit response', res );
			if ( ! res.success ) {
				dispatch( errorNotice( res.err ) );
			}
		} )
		.catch( ( err ) => debug( err ) ); // shouldn't get here
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
