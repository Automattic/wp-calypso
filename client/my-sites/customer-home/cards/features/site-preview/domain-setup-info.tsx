import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { createInterpolateElement, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InfoPopover from 'calypso/components/info-popover';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import type { DomainSummary } from '@automattic/api-core';

import './style.scss';

// Expired or expiring domains aren't being set up, and `pending_transfer` is an outgoing transfer.
const SETUP_STATUSES: DomainStatus[] = [
	DomainStatus.IN_PROGRESS,
	DomainStatus.PENDING_REGISTRATION,
	DomainStatus.TRANSFER_PENDING,
	DomainStatus.CONNECTION_ERROR,
	DomainStatus.TRANSFER_ERROR,
];

export function getPendingCustomDomain( domains: DomainSummary[], siteDomain: string ) {
	const customDomains = domains.filter(
		( domain ) =>
			domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS &&
			domain.subtype.id !== DomainSubtype.SITE_REDIRECT
	);
	const primaryDomain = customDomains.find( ( { primary_domain } ) => primary_domain );
	// `set_primary_domain_pending` can stay true for days after the site already serves from the domain.
	const servedDomain = siteDomain.replace( /^www\./, '' );

	// A new registration can already report "active" while it's still being made the primary address.
	return ( primaryDomain ? [ primaryDomain ] : customDomains ).find(
		( domain ) =>
			domain.domain !== servedDomain &&
			( SETUP_STATUSES.includes( domain.domain_status?.id ) ||
				domain.set_primary_domain_pending === true )
	);
}

/**
 * Lets a long domain wrap before its dots instead of in the middle of a label.
 */
function breakableDomain( domain: string ) {
	return domain.split( '.' ).map( ( label, index ) => (
		<Fragment key={ index }>
			{ index > 0 && (
				<>
					<wbr />.
				</>
			) }
			{ label }
		</Fragment>
	) );
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
				{ createInterpolateElement(
					/* translators: <domain /> is the custom domain being set up, <address /> is the address the site is currently reachable at. */
					__(
						'Your domain <domain /> is still being set up. In the meantime, your site is reachable at <address />.'
					),
					{
						domain: <strong>{ breakableDomain( pendingDomain.domain ) }</strong>,
						address: <strong>{ breakableDomain( siteDomain ) }</strong>,
					}
				) }
			</p>
			<a href={ domainManagementEdit( siteSlug, pendingDomain.domain ) }>
				{ __( 'View domain status' ) }
			</a>
		</InfoPopover>
	);
}
