import { type Callback } from '@automattic/calypso-router';
import ManagePricingPage from 'calypso/jetpack-cloud/sections/manage/pricing/primary';

export const JETPACK_COM_A4A_LANDING_PAGE = 'https://jetpack.com/for-agencies/';

export const jetpackManagePricingContext: Callback = ( context, next ) => {
	context.primary = <ManagePricingPage />;

	next();
};
