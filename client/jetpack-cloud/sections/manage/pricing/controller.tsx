import { type Callback } from '@automattic/calypso-router';
import ManagePricingPage from 'calypso/jetpack-cloud/sections/manage/pricing/primary';

export const jetpackManagePricingContext: Callback = ( context, next ) => {
	context.primary = <ManagePricingPage />;

	next();
};
