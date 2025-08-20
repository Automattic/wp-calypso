import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainPlaceholder() {
	const { domainName } = domainRoute.useParams();

	return <PageLayout size="small" header={ <PageHeader title={ domainName } /> }></PageLayout>;
}
