import config from '@automattic/calypso-config';
import { useEffect, useRef } from 'react';
import { trackPremiumAnalyticsPreviewEvent } from '../premium-analytics-preview/track-event';
import { PREMIUM_ANALYTICS_PREVIEW_FLAG } from './premium-analytics-preview-cohort';

type PreviewGateSignals = {
	isServerVisible: boolean;
	canManageOptions: boolean;
	hasCommercialStats: boolean;
	premiumAnalyticsDashboardUrl?: string | null;
	isVip: boolean;
	isP2: boolean;
	isPremiumAnalyticsEnabled?: boolean;
	isStatusError: boolean;
};

type NotShownSignals = PreviewGateSignals & {
	siteId: number | null;
	isWpcom: boolean;
	isSettled: boolean;
};

/**
 * The first gate that turned the invitation away, or null when the notice is shown.
 *
 * Checked in the order the gate resolves in, so the reason is the one a reader would reach first.
 */
const notShownReason = ( {
	isServerVisible,
	canManageOptions,
	hasCommercialStats,
	premiumAnalyticsDashboardUrl,
	isVip,
	isP2,
	isPremiumAnalyticsEnabled,
	isStatusError,
}: PreviewGateSignals ): string | null => {
	if ( ! config.isEnabled( PREMIUM_ANALYTICS_PREVIEW_FLAG ) ) {
		return 'flag_disabled';
	}
	if ( ! isServerVisible ) {
		return 'server_hidden';
	}
	if ( ! canManageOptions ) {
		return 'not_admin';
	}
	if ( ! hasCommercialStats ) {
		return 'no_commercial_stats';
	}
	if ( ! premiumAnalyticsDashboardUrl ) {
		return 'no_admin_url';
	}
	if ( isVip ) {
		return 'is_vip';
	}
	if ( isP2 ) {
		return 'is_p2';
	}
	if ( isPremiumAnalyticsEnabled === true ) {
		return 'already_enabled';
	}
	// A failed read leaves the setting undefined too, so it gets its own reason rather than being
	// filed as a Jetpack too old to register it.
	if ( isStatusError ) {
		return 'status_request_failed';
	}
	if ( isPremiumAnalyticsEnabled === undefined ) {
		return 'setting_unavailable';
	}

	return null;
};

/**
 * Record one Tracks event per site when the preview invitation is not going to be shown.
 *
 * The five events the notice records all need it to mount first, which leaves the rate of sites
 * we skip without a denominator.
 */
export default function usePremiumAnalyticsPreviewNotShownEvent( {
	siteId,
	isWpcom,
	isSettled,
	isServerVisible,
	canManageOptions,
	hasCommercialStats,
	premiumAnalyticsDashboardUrl,
	isVip,
	isP2,
	isPremiumAnalyticsEnabled,
	isStatusError,
}: NotShownSignals ) {
	const recordedSiteId = useRef< number | null >( null );

	useEffect( () => {
		if ( ! siteId || ! isSettled || recordedSiteId.current === siteId ) {
			return;
		}

		// Self-hosted Jetpack sites are out of this rollout round and are a large share of Odyssey
		// traffic, so counting them would swamp the rate this event exists to measure.
		if ( ! isWpcom ) {
			return;
		}

		const reason = notShownReason( {
			isServerVisible,
			canManageOptions,
			hasCommercialStats,
			premiumAnalyticsDashboardUrl,
			isVip,
			isP2,
			isPremiumAnalyticsEnabled,
			isStatusError,
		} );

		if ( ! reason ) {
			return;
		}

		recordedSiteId.current = siteId;
		trackPremiumAnalyticsPreviewEvent( 'notice', 'not_shown', siteId, { reason } );
	}, [
		siteId,
		isWpcom,
		isSettled,
		isServerVisible,
		canManageOptions,
		hasCommercialStats,
		premiumAnalyticsDashboardUrl,
		isVip,
		isP2,
		isPremiumAnalyticsEnabled,
		isStatusError,
	] );
}
