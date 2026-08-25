import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import { upsell } from '../../components/icons';
import { useAnalytics } from '../analytics';
import {
	FREE_DOMAIN_UPSELL_ID,
	getFreeDomainUpsellHref,
	isFreeDomainUpsellEligible,
} from '../free-domain-upsell';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

import './plugin-free-domain.scss';

export function useFreeDomainPlugin( { site }: { site?: Site } ): OmnibarNode | undefined {
	const { recordTracksEvent } = useAnalytics();
	const isEligible = isFreeDomainUpsellEligible( site );

	const hasRecordedImpression = useRef( false );
	useEffect( () => {
		if ( ! isEligible || hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		recordTracksEvent( 'calypso_omnibar_upsell_impression', {
			upsell_id: FREE_DOMAIN_UPSELL_ID,
			surface: 'calypso',
		} );
	}, [ isEligible, recordTracksEvent ] );

	if ( ! isEligible ) {
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
				surface: 'calypso',
			} ),
		render: () => (
			<span className="omnibar__free-domain-chip">
				<Icon icon={ upsell } size={ 16 } />
				{ __( 'Free domain' ) }
			</span>
		),
	};
}
