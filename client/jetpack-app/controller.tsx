import page from 'page';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import JetpackAppEmptyContent from './empty';
import JetpackAppPlans from './plans/main';

export function jetpackAppPlans( context: PageJS.Context, next: () => void ) {
	context.primary = (
		<JetpackAppPlans
			paidDomainName={ context.query.paid_domain_name }
			originalUrl={ context.originalUrl }
		/>
	);

	next();
}

export function redirectIfNotJetpackApp( _context: PageJS.Context, next: () => void ) {
	if ( ! isWpMobileApp() ) {
		page.redirect( '/' );
	} else {
		next();
	}
}

export function pageNotFound( context: PageJS.Context, next: () => void ) {
	context.primary = <JetpackAppEmptyContent />;
	next();
}
