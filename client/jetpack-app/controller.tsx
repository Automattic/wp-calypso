import page, { type Callback } from '@automattic/calypso-router';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import JetpackAppEmptyContent from './empty';
import JetpackAppPlans from './plans/main';

export const jetpackAppPlans: Callback = ( context, next ) => {
	context.primary = (
		<JetpackAppPlans
			paidDomainName={ context.query.paid_domain_name }
			originalUrl={ context.originalUrl }
		/>
	);

	next();
};

export const redirectIfNotJetpackApp: Callback = ( _context, next ) => {
	if ( ! isWpMobileApp() ) {
		page.redirect( '/' );
	} else {
		next();
	}
};

export const pageNotFound: Callback = ( context, next ) => {
	context.primary = <JetpackAppEmptyContent />;
	next();
};
