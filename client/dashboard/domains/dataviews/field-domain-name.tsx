import { DomainSubtype } from '@automattic/api-core';
import { Badge } from '@automattic/ui';
import { Link } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainOverviewRoute } from '../../app/router/domains';
import { textOverflowStyles } from './utils';
import type { DomainSummary, Site } from '@automattic/api-core';

export const DomainNameField = ( {
	domain,
	site,
	value,
	showPrimaryDomainBadge,
}: {
	domain: DomainSummary;
	site?: Site;
	value: string;
	showPrimaryDomainBadge?: boolean;
} ) => {
	const siteSlug = site?.slug ?? domain.site_slug;

	return (
		<Link
			to={ domainOverviewRoute.fullPath }
			params={ { siteSlug, domainName: domain.domain } }
			disabled={ domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS }
		>
			<HStack spacing={ 1 }>
				<span style={ textOverflowStyles }>{ value }</span>
				{ showPrimaryDomainBadge && domain.primary_domain && (
					<span style={ { flexShrink: 0 } }>
						<Badge>{ __( 'Primary' ) }</Badge>
					</span>
				) }
			</HStack>
		</Link>
	);
};
