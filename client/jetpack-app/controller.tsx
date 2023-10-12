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
