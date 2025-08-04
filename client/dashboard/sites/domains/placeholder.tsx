import { siteDomainRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainPlaceholder() {
	const { domainName } = siteDomainRoute.useParams();

	return <PageLayout size="small" header={ <PageHeader title={ domainName } /> }></PageLayout>;
}
