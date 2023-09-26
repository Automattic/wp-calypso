import JetpackAppPlans from './main';

export function jetpackAppPlans( context, next ) {
	context.primary = (
		<JetpackAppPlans
			domainName={ context.query.domain_name }
			redirectTo={ context.query.redirect_to }
		/>
	);
	next();
}
