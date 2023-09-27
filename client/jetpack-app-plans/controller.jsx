import JetpackAppPlans from './main';

export function jetpackAppPlans( context, next ) {
	context.primary = (
		<JetpackAppPlans
			paidDomainName={ context.query.paid_domain_name }
			redirectTo={ context.query.redirect_to }
		/>
	);

	// Hide sidebar
	context.secondary = null;
	next();
}
