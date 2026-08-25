/* eslint-disable no-restricted-imports */
import { Icon, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { upsell } from '../../components/icons';
import {
	FREE_DOMAIN_UPSELL_ID,
	getFreeDomainUpsellHref,
	isFreeDomainUpsellEligible,
} from '../free-domain-upsell';
import type { Site } from '@automattic/api-core';

import './omnibar-free-domain-chip.scss';

export function OmnibarFreeDomainChip( { site }: { site: Site } ) {
	const isEligible = isFreeDomainUpsellEligible( site );
	const siteId = site.ID;

	// One impression per site: switching sites in the same mount re-fires.
	const impressionSiteIds = useRef( new Set< number >() );
	useEffect( () => {
		if ( ! isEligible || impressionSiteIds.current.has( siteId ) ) {
			return;
		}
		impressionSiteIds.current.add( siteId );
		recordTracksEvent( 'calypso_omnibar_upsell_impression', {
			upsell_id: FREE_DOMAIN_UPSELL_ID,
			surface: 'msd',
		} );
	}, [ isEligible, siteId ] );

	if ( ! isEligible ) {
		return null;
	}

	return (
		<Tooltip text={ __( 'Free domain with an annual plan' ) } placement="bottom">
			<a
				className="masterbar__item masterbar__item--always-show-content masterbar__item-free-domain-chip"
				href={ getFreeDomainUpsellHref( site ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_omnibar_upsell_click', {
						upsell_id: FREE_DOMAIN_UPSELL_ID,
						surface: 'msd',
					} )
				}
			>
				<span className="masterbar__free-domain-chip-pill">
					<Icon icon={ upsell } size={ 16 } />
					{ __( 'Free domain' ) }
				</span>
			</a>
		</Tooltip>
	);
}
