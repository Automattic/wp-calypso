import JetpackAppPlans from './main';

export function jetpackAppPlans( context, next ) {
	context.primary = <JetpackAppPlans domainName={ context.query.domainName } />;
	next();
}
