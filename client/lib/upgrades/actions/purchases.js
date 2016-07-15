/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import notices from 'notices';

const debug = debugFactory( 'calypso:upgrades:actions:purchases' ),
	wpcom = wp.undocumented();

function cancelPurchase( purchaseId, onComplete ) {
	wpcom.cancelPurchase( purchaseId, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		onComplete( success );
	} );
}

function cancelAndRefundPurchase( purchaseId, data, onComplete ) {
	wpcom.cancelAndRefundPurchase( purchaseId, data, onComplete );
}

function submitSurvey( surveyName, siteID, surveyData ) {
	const survey = wp.marketing().survey( surveyName, siteID );
	survey.addResponses( surveyData );

	debug( 'Survey responses', survey );
	survey.submit()
		.then( res => {
			debug( 'Survey submit response', res );
			if ( ! res.success ) {
				notices.error( res.err );
			}
		} )
		.catch( err => debug( err ) ); // shouldn't get here
}

export {
	cancelAndRefundPurchase,
	cancelPurchase,
	submitSurvey
};
