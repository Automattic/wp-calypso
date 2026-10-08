import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { getDifmOfferCopy, useDifmOffer } from '../../utils/difm-offer';
import DIFMUpsellCard from '../overview-difm-upsell-card';
import illustrationUrl from '../overview-difm-upsell-card/upsell-illustration.svg';
import type { Site } from '@automattic/api-core';

import './style.scss';

const UPSELL_ID = 'site-overview-difm-offer';
const UPSELL_FEATURE_ID = 'difm-offer';

/**
 * Fills the DIFM slot in the site overview. A user in a treatment arm of the DIFM
 * offer experiment sees the offer; everyone else sees the existing DIFM upsell.
 * While an eligible user's assignment loads, the slot stays empty: mounting the old
 * card first would record its upsell impression for users in a treatment arm.
 *
 * The offer is for one site, so its dismissal is stored per site. A dismissed offer
 * leaves the slot empty instead of falling back to the paid DIFM upsell.
 */
export default function DIFMOfferCard( { site }: { site: Site } ) {
	const localeSlug = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const { isLoading, variation } = useDifmOffer( {
		planSlug: site.plan?.product_slug,
		siteCreatedAt: site.options?.created_at,
		localeSlug,
		isA4ADevSite: site.is_a4a_dev_site,
	} );
	const copy = getDifmOfferCopy( variation );

	const preferenceName = `hosting-dashboard-difm-offer-dismissed-${ site.ID }` as const;
	const { data: dismissedAt, isLoading: isDismissalLoading } = useQuery( {
		...userPreferenceQuery( preferenceName ),
		enabled: !! copy,
	} );
	const { mutate: saveDismissal } = useMutation( userPreferenceMutation( preferenceName ) );
	// Hide the offer as soon as it is dismissed, without waiting for the preference to save.
	const [ isDismissedLocally, setIsDismissedLocally ] = useState( false );

	if ( isLoading ) {
		return null;
	}

	if ( ! copy ) {
		return <DIFMUpsellCard site={ site } />;
	}

	if ( isDismissalLoading || dismissedAt || isDismissedLocally ) {
		return null;
	}

	const tracksProperties = { variation };

	const handleDismiss = () => {
		setIsDismissedLocally( true );
		saveDismissal( new Date().toISOString() );
		recordTracksEvent( 'calypso_dashboard_upsell_dismiss', {
			...tracksProperties,
			upsell_id: UPSELL_ID,
			upsell_feature_id: UPSELL_FEATURE_ID,
		} );
	};

	return (
		<div className="dashboard-difm-offer-card">
			<Callout
				title={ copy.title }
				titleAs="h2"
				description={ <Text variant="muted">{ copy.description }</Text> }
				image={ illustrationUrl }
				imageAlt={ __( 'Responsive website design' ) }
				imageVariant="full-bleed"
				actions={
					<UpsellCTAButton
						text={ copy.ctaText }
						variant="secondary"
						upsellId={ UPSELL_ID }
						upsellFeatureId={ UPSELL_FEATURE_ID }
						tracksProperties={ tracksProperties }
						onClick={ () => {
							// The offer modal opens here in a follow-up.
						} }
					/>
				}
			/>
			<Button
				className="dashboard-difm-offer-card__dismiss"
				icon={ close }
				label={ __( 'Dismiss' ) }
				size="small"
				onClick={ handleDismiss }
			/>
		</div>
	);
}
