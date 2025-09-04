import { domainConnectionSetupInfoQuery, domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainConnectionSetup() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery(
			domainName,
			domain.blog_id,
			`https://wordpress.com/v2/domains/${ domainName }/domain-connection-setup`
		)
	);

	return (
		<PageLayout size="small" header={ <PageHeader title="Domain Connection Setup" /> }>
			{ domainName }
			{ domainConnectionSetupInfo.connection_mode }
		</PageLayout>
	);
}
