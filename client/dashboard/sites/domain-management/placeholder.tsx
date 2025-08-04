import { siteDomainRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainManagementPlaceholder() {
	const { domainName } = siteDomainRoute.useParams();

	return <PageLayout size="small" header={ <PageHeader title={ domainName } /> }></PageLayout>;
}
