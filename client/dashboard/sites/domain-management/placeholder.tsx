import { useParams } from '@tanstack/react-router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainManagementPlaceholder() {
	const { domainName } = useParams( { from: '/sites/$siteSlug/domains/$domainName' } );

	return <PageLayout size="small" header={ <PageHeader title={ domainName } /> }></PageLayout>;
}
