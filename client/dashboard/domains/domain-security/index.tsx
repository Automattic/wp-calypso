import { domainQuery, sslDetailsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DnsSec from './dnssec';
import SslCertificate from './ssl-certificate';

export default function DomainSecurity() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: sslDetails } = useSuspenseQuery( sslDetailsQuery( domainName ) );

	return (
		<PageLayout size="small" header={ <PageHeader title="Security" /> }>
			<SslCertificate domainName={ domainName } domain={ domain } sslDetails={ sslDetails } />
			<DnsSec domainName={ domainName } domain={ domain } />
		</PageLayout>
	);
}
