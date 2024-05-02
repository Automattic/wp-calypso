import { type Callback } from '@automattic/calypso-router';
import { getQueryArgs, addQueryArgs } from '@wordpress/url';
import ManagePricingPage from 'calypso/jetpack-cloud/sections/manage/pricing/primary';

const JETPACK_COM_A4A_LANDING_PAGE = 'https://jetpack.com/for-agencies/';

export const jetpackManagePricingContext: Callback = ( context, next ) => {
	context.primary = <ManagePricingPage />;

	next();
};

export const redirectToJetpackComA4aLanding: Callback = () => {
	const args = getQueryArgs( window.location.href );
	const jetpackA4aLandingPage = addQueryArgs( JETPACK_COM_A4A_LANDING_PAGE, args );

	window.location.href = jetpackA4aLandingPage;
	return;
};
