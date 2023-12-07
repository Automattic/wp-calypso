import JetpackAppEmptyContent from './empty';
import JetpackAppPlans from './plans/main';
import type { Callback } from '@automattic/calypso-router';

export const jetpackAppPlans: Callback = ( context, next ) => {
	context.primary = (
		<JetpackAppPlans
			paidDomainName={ context.query.paid_domain_name }
			originalUrl={ context.originalUrl }
		/>
	);

	next();
};

export const pageNotFound: Callback = ( context, next ) => {
	context.primary = <JetpackAppEmptyContent />;
	next();
};
