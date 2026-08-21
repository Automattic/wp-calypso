/* eslint-disable no-restricted-imports */
import { isEnabled } from '@automattic/calypso-config';
import { Icon, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getDomainAndPlanUpsellUrl } from 'calypso/lib/domains/get-domain-and-plan-upsell-url';
import { upsell } from '../../components/icons';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

import './omnibar-free-domain-chip.scss';

const UPSELL_ID = 'omnibar-free-domain';

export function OmnibarFreeDomainChip( { site }: { site: Site } ) {
	const isEligible =
		isEnabled( 'dashboard/omnibar-free-domain-chip' ) &&
		!! site.plan?.is_free &&
		isSimple( site ) &&
		! site.is_wpcom_staging_site;

	const hasRecordedImpression = useRef( false );
	useEffect( () => {
		if ( ! isEligible || hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		recordTracksEvent( 'calypso_omnibar_upsell_impression', { upsell_id: UPSELL_ID } );
	}, [ isEligible ] );

	if ( ! isEligible ) {
		return null;
	}

	return (
		<Tooltip text={ __( 'Free domain with an annual plan' ) } placement="bottom">
			<a
				className="masterbar__item masterbar__item--always-show-content masterbar__item-free-domain-chip"
				href={ getDomainAndPlanUpsellUrl( { siteSlug: site.slug } ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_omnibar_upsell_click', { upsell_id: UPSELL_ID } )
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
