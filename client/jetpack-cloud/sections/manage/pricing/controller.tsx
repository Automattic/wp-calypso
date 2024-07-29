import { type Callback } from '@automattic/calypso-router';
import { getQueryArgs, addQueryArgs } from '@wordpress/url';
import { JETPACK_COM_A4A_LANDING_PAGE } from 'calypso/jetpack-cloud/sections/manage/pricing/constants';
import ManagePricingPage from 'calypso/jetpack-cloud/sections/manage/pricing/primary';

export const jetpackManagePricingContext: Callback = ( context, next ) => {
	context.primary = <ManagePricingPage />;

	next();
};

export const redirectToJetpackComA4aLanding: Callback = () => {
	const args = getQueryArgs( window.location.href );
	// The JETPACK_COM_A4A_LANDING_PAGE is only available in English at this time, so we
	// won't worry about localizing the link for now. Although we may want to localize it
	// in the future when/if the page gets translated & posted to other languages/locales.
	const jetpackA4aLandingPage = addQueryArgs( JETPACK_COM_A4A_LANDING_PAGE, args );

	window.location.assign( jetpackA4aLandingPage );
	return;
};
