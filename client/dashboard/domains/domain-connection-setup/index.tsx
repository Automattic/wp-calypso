import {
	domainConnectionSetupInfoQuery,
	domainMappingStatusQuery,
	domainQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { domainRoute, domainConnectionSetupRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainConnectionSetup from './domain-connection-setup';
import DomainConnectionVerification from './domain-connection-verification';

import './style.scss';

export default function DomainConnection() {
	const { domainName } = domainRoute.useParams();
	const { error: queryError, error_description: queryErrorDescription } = domainRoute.useSearch();

	// Load domain data
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const siteSlug = domain.site_slug;

	// Load domain connection setup info
	const router = useRouter();
	const relativePath = router.buildLocation( {
		to: domainConnectionSetupRoute.fullPath,
		params: { domainName },
	} ).href;
	const returnUrl = new URL( relativePath, window.location.origin ).href + '?step=dc_return';
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery( domainName, domain.blog_id, returnUrl )
	);
	const { data: domainMappingStatus } = useSuspenseQuery( domainMappingStatusQuery( domainName ) );

	const isVerificationStep = domainConnectionSetupInfo.connection_mode;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={
						isVerificationStep
							? __( 'Domain connection verification' )
							: __( 'Domain connection setup' )
					}
				/>
			}
		>
			{ isVerificationStep ? (
				<DomainConnectionVerification
					domainName={ domainName }
					siteSlug={ siteSlug }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					domainMappingStatus={ domainMappingStatus }
					queryError={ queryError }
					queryErrorDescription={ queryErrorDescription }
				/>
			) : (
				<DomainConnectionSetup
					domainName={ domainName }
					siteSlug={ siteSlug }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			) }
		</PageLayout>
	);
}
