import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import InfoPopover from 'calypso/components/info-popover';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import type { DomainSummary } from '@automattic/api-core';

import './style.scss';

export function getPendingCustomDomain( domains: DomainSummary[], siteDomain: string ) {
	const customDomains = domains.filter(
		( domain ) =>
			domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS &&
			domain.subtype.id !== DomainSubtype.SITE_REDIRECT
	);
	const domain =
		customDomains.find( ( { primary_domain } ) => primary_domain ) ?? customDomains[ 0 ];

	// When the site already serves from the custom domain, statuses like "expiring soon"
	// don't mean the displayed address differs from the one the user bought.
	if ( ! domain || domain.domain === siteDomain.replace( /^www\./, '' ) ) {
		return undefined;
	}

	// A new registration can already report "active" while it's still being made the primary address.
	const isSettingUp =
		domain.domain_status?.id !== DomainStatus.ACTIVE || domain.set_primary_domain_pending === true;

	return isSettingUp ? domain : undefined;
}

interface DomainSetupInfoProps {
	siteId: number;
	siteSlug: string;
	siteDomain: string;
}

export default function DomainSetupInfo( { siteId, siteSlug, siteDomain }: DomainSetupInfoProps ) {
	const { data: pendingDomain } = useQuery( {
		...domainsQuery(),
		enabled: !! siteId,
		select: ( data ) =>
			getPendingCustomDomain(
				data.filter( ( domain ) => domain.blog_id === siteId ),
				siteDomain
			),
	} );

	if ( ! pendingDomain ) {
		return null;
	}

	return (
		<InfoPopover
			className="home-site-preview__domain-setup-info"
			icon="info-outline"
			iconSize={ 16 }
			position="bottom"
			aria-label={ __( 'Domain setup status' ) }
		>
			<p className="home-site-preview__domain-setup-info-text">
				{ sprintf(
					/* translators: %1$s is the custom domain being set up, %2$s is the address the site is currently reachable at. */
					__(
						'Your domain %1$s is still being set up. In the meantime, your site is reachable at %2$s.'
					),
					pendingDomain.domain,
					siteDomain
				) }
			</p>
			<a href={ domainManagementEdit( siteSlug, pendingDomain.domain ) }>
				{ __( 'View domain status' ) }
			</a>
		</InfoPopover>
	);
}
