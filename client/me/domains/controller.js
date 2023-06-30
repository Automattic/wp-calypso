import DomainManagementData from 'calypso/components/data/domain-management';
import DomainManagement from 'calypso/my-sites/domains/domain-management/index.jsx';

export function domains( context, next ) {
	context.primary = (
		<DomainManagementData component={ DomainManagement.AllDomains } context={ context } />
	);
	next();
}
