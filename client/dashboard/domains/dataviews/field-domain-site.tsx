import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { siteRoute } from '../../app/router/sites';
import { Text } from '../../components/text';
import SiteIcon from '../../sites/site-icon';
import type { DomainSummary } from '@automattic/api-core';

export const DomainSiteField = ( { domain, value }: { domain: DomainSummary; value: string } ) => {
	const { data: site } = useQuery( siteBySlugQuery( domain.site_slug ) );

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
