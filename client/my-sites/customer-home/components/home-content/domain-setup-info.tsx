import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { Gridicon, Tooltip } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useRef, useState } from 'react';
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

	return domain.domain_status?.id !== DomainStatus.ACTIVE ? domain : undefined;
}

interface DomainSetupInfoProps {
	siteId: number;
	siteSlug: string;
	siteDomain: string;
}

export default function DomainSetupInfo( { siteId, siteSlug, siteDomain }: DomainSetupInfoProps ) {
	const linkRef = useRef< HTMLAnchorElement >( null );
	const [ isTooltipVisible, setIsTooltipVisible ] = useState( false );
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

	const label = sprintf(
		/* translators: %1$s is the custom domain being set up, %2$s is the address the site is currently reachable at. */
		__(
			'Your domain %1$s is still being set up. In the meantime, your site is reachable at %2$s. View domain status →'
		),
		pendingDomain.domain,
		siteDomain
	);

	return (
		<>
			<a
				ref={ linkRef }
				href={ domainManagementEdit( siteSlug, pendingDomain.domain ) }
				className="customer-home__site-domain-info"
				aria-label={ label }
				onMouseEnter={ () => setIsTooltipVisible( true ) }
				onMouseLeave={ () => setIsTooltipVisible( false ) }
				onFocus={ () => setIsTooltipVisible( true ) }
				onBlur={ () => setIsTooltipVisible( false ) }
			>
				<Gridicon icon="info" size={ 16 } />
			</a>
			<Tooltip context={ linkRef } isVisible={ isTooltipVisible } position="bottom">
				{ label }
			</Tooltip>
		</>
	);
}
