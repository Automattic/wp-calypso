import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardBody } from '@wordpress/components';
import { domainsQuery } from '../../app/queries/domains';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import { domainRoute } from '../../app/routes/domain-routes';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function DomainPlaceholder() {
	const { data: allDomains } = useSuspenseQuery( domainsQuery() );

	// get the current domain from the current route
	const { domainName } = domainRoute.useParams();

	// get the domain details using the site domain
	const domain = allDomains.find( ( domain ) => domain.domain === domainName );

	if ( ! domain ) {
		throw new Error( 'Domain not found' );
	}

	const { data: siteDomains } = useSuspenseQuery( siteDomainsQuery( domain.blog_id ) );

	const siteDomain = siteDomains.find( ( siteDomain ) => siteDomain.domain === domainName );

	return (
		<PageLayout size="small" header={ <PageHeader title="DNSSEC" /> }>
			<Card>
				<CardBody>
					{ siteDomain?.is_dnssec_enabled ? 'DNSSEC Enabled' : 'DNSSEC Disabled' }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
