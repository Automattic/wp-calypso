import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { upsell } from '../../components/icons';
import { useAnalytics } from '../analytics';
import {
	FREE_DOMAIN_UPSELL_ID,
	getFreeDomainUpsellHref,
	getFreeDomainUpsellSource,
	useFreeDomainUpsellExperiment,
} from '../free-domain-upsell';
import type { FreeDomainUpsellSurface } from '../free-domain-upsell';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-free-domain.scss';

export function useFreeDomainPlugin( {
	site,
	surface,
}: {
	site?: Site;
	surface: FreeDomainUpsellSurface;
} ): OmnibarNode | undefined {
	const { recordTracksEvent } = useAnalytics();
	const { showChip, isQaOverride } = useFreeDomainUpsellExperiment( site );
	const upsellSource = getFreeDomainUpsellSource( site );
	const siteId = site?.ID;

	// One impression per site: switching sites in the same mount re-fires.
	const impressionSiteIds = useRef( new Set< number >() );
	useEffect( () => {
		if ( ! showChip || ! siteId || impressionSiteIds.current.has( siteId ) ) {
			return;
		}
		impressionSiteIds.current.add( siteId );
		recordTracksEvent( 'calypso_omnibar_upsell_impression', {
			upsell_id: FREE_DOMAIN_UPSELL_ID,
			surface,
			upsell_source: upsellSource,
			...( isQaOverride && { qa_override: true } ),
		} );
	}, [ showChip, isQaOverride, upsellSource, siteId, surface, recordTracksEvent ] );

	if ( ! site || ! showChip ) {
		return undefined;
	}

	return {
		id: 'free-domain',
		href: getFreeDomainUpsellHref( site ),
		label: __( 'Free domain with an annual plan' ),
		className: 'omnibar__free-domain',
		onClick: () =>
			recordTracksEvent( 'calypso_omnibar_upsell_click', {
				upsell_id: FREE_DOMAIN_UPSELL_ID,
				surface,
				upsell_source: upsellSource,
				...( isQaOverride && { qa_override: true } ),
			} ),
		render: () => (
			<span className="omnibar__free-domain-chip">
				<Icon icon={ upsell } size={ 16 } />
				{ __( 'Free domain' ) }
			</span>
		),
	};
}
