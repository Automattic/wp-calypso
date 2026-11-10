import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { useLocale } from '../../app/locale';
import { Callout } from '../../components/callout';
import DifmOfferModal from '../../components/difm-offer-modal';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { getDifmOfferCopy, useDifmOffer } from '../../utils/difm-offer';
import { useDifmOfferEngagementTracking } from '../../utils/use-difm-offer-engagement-tracking';
import DIFMUpsellCard from '../overview-difm-upsell-card';
import illustrationUrl from './difm-offer-illustration.webp';
import type { Site } from '@automattic/api-core';

import './style.scss';

const UPSELL_ID = 'site-overview-difm-offer';
const UPSELL_FEATURE_ID = 'difm-offer';
// The themes banner and the Site Setup banner record these names through Calypso's Banner,
// so one query covers every DIFM offer surface.
const TRACKS_EVENT_NAMES = {
	impression: 'calypso_banner_cta_impression',
	click: 'calypso_banner_cta_click',
};
const DISMISS_EVENT = 'calypso_banner_dismiss';

/**
 * Fills the DIFM slot in the site overview. A user in a treatment arm of the DIFM
 * offer experiment sees the offer; everyone else sees the existing DIFM upsell.
 * While an eligible user's assignment loads, the slot stays empty: mounting the old
 * card first would record its upsell impression for users in a treatment arm.
 *
 * A dismissal is stored per user: dismissing the offer on one site hides it on all
 * of the user's sites. A dismissed offer leaves the slot empty instead of falling
 * back to the paid DIFM upsell.
 */
export default function DIFMOfferCard( { site }: { site: Site } ) {
	const localeSlug = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const { isLoading, variation } = useDifmOffer( {
		planSlug: site.plan?.product_slug,
		siteCreatedAt: site.options?.created_at,
		localeSlug,
		isA4ADevSite: site.is_a4a_dev_site,
	} );
	const copy = getDifmOfferCopy( variation );

	const preferenceName = 'hosting-dashboard-difm-offer-dismissed';
	const { data: dismissedAt, isLoading: isDismissalLoading } = useQuery( {
		...userPreferenceQuery( preferenceName ),
		enabled: !! copy,
	} );
	const { mutate: saveDismissal } = useMutation( userPreferenceMutation( preferenceName ) );
	// Hide the offer as soon as it is dismissed, without waiting for the preference to save.
	const [ isDismissedLocally, setIsDismissedLocally ] = useState( false );
	const engagementRef = useDifmOfferEngagementTracking( recordTracksEvent, {
		upsell_id: UPSELL_ID,
		upsell_feature_id: UPSELL_FEATURE_ID,
		variation,
	} );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	if ( isLoading ) {
		return null;
	}

	if ( ! copy || variation === 'control' ) {
		return <DIFMUpsellCard site={ site } />;
	}

	if ( isDismissalLoading || dismissedAt || isDismissedLocally ) {
		return null;
	}

	// Banner adds cta_name and cta_size to its impression and click, and cta_name to its dismiss.
	const tracksProperties = { variation, cta_name: UPSELL_ID, cta_size: 'regular' };

	const handleDismiss = () => {
		setIsDismissedLocally( true );
		saveDismissal( new Date().toISOString() );
		recordTracksEvent( DISMISS_EVENT, {
			variation,
			cta_name: UPSELL_ID,
			upsell_id: UPSELL_ID,
			upsell_feature_id: UPSELL_FEATURE_ID,
		} );
	};

	return (
		<div className="dashboard-difm-offer-card" ref={ engagementRef }>
			<Callout
				title={ copy.title }
				titleAs="h2"
				description={
					<Text variant="muted" className="dashboard-difm-offer-card__description">
						{ copy.description }
					</Text>
				}
				image={ illustrationUrl }
				imageAlt={ __( 'A smiling woman works on a laptop, surrounded by design tools' ) }
				imageVariant="full-bleed"
				actions={
					<UpsellCTAButton
						text={ copy.ctaText }
						variant="secondary"
						upsellId={ UPSELL_ID }
						upsellFeatureId={ UPSELL_FEATURE_ID }
						tracksProperties={ tracksProperties }
						tracksEventNames={ TRACKS_EVENT_NAMES }
						onClick={ () => setIsModalOpen( true ) }
					/>
				}
			/>
			<Button
				className="dashboard-difm-offer-card__dismiss"
				icon={ closeSmall }
				label={ __( 'Dismiss' ) }
				size="small"
				onClick={ handleDismiss }
			/>
			{ isModalOpen && (
				<DifmOfferModal
					site={ site }
					userEmail={ user.email }
					variation={ variation }
					source="site-overview"
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</div>
	);
}
