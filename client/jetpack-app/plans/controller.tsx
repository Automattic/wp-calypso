import JetpackAppPlans from './main';

export function jetpackAppPlans( context: PageJS.Context, next: () => void ) {
	context.primary = (
		<JetpackAppPlans
			paidDomainName={ context.query.paid_domain_name }
			redirectTo={ context.query.redirect_to }
		/>
	);

	next();
}
