import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainTransferToOtherSiteRoute } from '../../app/router/domains';
import { siteRoute } from '../../app/router/sites';
import SiteIcon from '../../components/site-icon';
import { Text } from '../../components/text';
import type { DomainSummary } from '@automattic/api-core';

export const DomainSiteField = ( { domain, value }: { domain: DomainSummary; value: string } ) => {
	const { data: site } = useQuery( siteBySlugQuery( domain.site_slug ) );

	if ( domain.is_domain_only_site ) {
		return (
			<Link to={ domainTransferToOtherSiteRoute.fullPath } params={ { domainName: domain.domain } }>
				{ __( 'Attach site' ) }
			</Link>
		);
	}

	return (
		<HStack spacing={ 2 } alignment="left">
			{ site && <SiteIcon size={ 16 } site={ site } /> }
			<Link
				to={ siteRoute.fullPath }
				params={ { siteSlug: domain?.site_slug } }
				style={ { textDecoration: 'none' } }
			>
				<Text>{ value }</Text>
			</Link>
		</HStack>
	);
};
