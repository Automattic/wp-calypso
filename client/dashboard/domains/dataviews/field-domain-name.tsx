import { DomainSubtype } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainOverviewRoute } from '../../app/router/domains';
import { Text } from '../../components/text';
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
			disabled={ ! domain.subscription_id }
		>
			<VStack spacing={ 1 }>
				<span style={ textOverflowStyles }>{ value }</span>
				{ showPrimaryDomainBadge && domain.primary_domain && (
					<span
						style={ {
							...textOverflowStyles,
							color: 'var(--dashboard__foreground-color-success)',
							fontWeight: 'normal',
							textDecoration: 'underline',
							textDecorationStyle: 'dotted',
						} }
					>
						{ __( 'Primary site address' ) }
					</span>
				) }
				{ domain.subtype.id !== DomainSubtype.DOMAIN_REGISTRATION && (
					<Text variant="muted" style={ { ...textOverflowStyles, fontWeight: 'normal' } }>
						{ domain.subtype.label }
					</Text>
				) }
			</VStack>
		</Link>
	);
};
