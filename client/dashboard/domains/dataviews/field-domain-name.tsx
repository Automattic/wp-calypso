import { DomainSubtype } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { Link } from '@tanstack/react-router';
import { Tooltip, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainOverviewRoute, domainTransferRoute } from '../../app/router/domains';
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

	const href =
		domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER &&
		config.isEnabled( 'domain-transfer-redesign' )
			? domainTransferRoute.fullPath
			: domainOverviewRoute.fullPath;

	const content = (
		<VStack spacing={ 1 }>
			<span style={ textOverflowStyles }>{ value }</span>
			{ showPrimaryDomainBadge && domain.primary_domain && (
				<Tooltip text={ __( 'The address people see when visiting your site.' ) }>
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
				</Tooltip>
			) }
			{ domain.subtype.id !== DomainSubtype.DOMAIN_REGISTRATION && (
				<Text variant="muted" style={ { ...textOverflowStyles, fontWeight: 'normal' } }>
					{ domain.subtype.label }
				</Text>
			) }
		</VStack>
	);

	if ( ! domain.subscription_id ) {
		return content;
	}

	return (
		<Link to={ href } params={ { siteSlug, domainName: domain.domain } }>
			{ content }
		</Link>
	);
};
