import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import { trackPremiumAnalyticsPreviewEvent } from '../premium-analytics-preview/track-event';
import { PREMIUM_ANALYTICS_PREVIEW_FLAG } from './premium-analytics-preview-cohort';
import type { NoticeIdType } from '../hooks/use-notice-visibility-query';

type PreviewGateSignals = {
	isServerVisible: boolean;
	canManageOptions: boolean;
	hasSiteFeatures: boolean;
	hasCommercialStats: boolean;
	premiumAnalyticsDashboardUrl?: string | null;
	isVip: boolean;
	isP2: boolean;
	isPremiumAnalyticsEnabled?: boolean;
	isStatusError: boolean;
	/** The notice that won the conflict group over the invitation, when one did. */
	suppressedBy?: NoticeIdType | null;
};

type NotShownSignals = PreviewGateSignals & {
	siteId: number | null;
	isWpcom: boolean;
	isSettled: boolean;
};

/**
 * Sites already counted, for as long as the page is open.
 *
 * Module scope rather than a ref: the host mounts on the Traffic page alone, so a round trip
 * through Insights would otherwise count the site again, and the answer can genuinely change
 * under us — a dismissal refetches the notices and an accepted invitation writes the status
 * cache, both of which look like a fresh reason to a per-mount guard.
 *
 * Exported for tests, which share the module across cases.
 */
export const recordedSiteIds = new Set< number >();

/**
 * The first gate that turned the invitation away, or null when the notice is shown.
 *
 * Checked in the order the gate resolves in, so the reason is the one a reader would reach first.
 */
const notShownReason = ( {
	isServerVisible,
	canManageOptions,
	hasSiteFeatures,
	hasCommercialStats,
	premiumAnalyticsDashboardUrl,
	isVip,
	isP2,
	isPremiumAnalyticsEnabled,
	isStatusError,
	suppressedBy,
}: PreviewGateSignals ): string | null => {
	if ( ! isServerVisible ) {
		return 'server_hidden';
	}
	if ( ! canManageOptions ) {
		return 'not_admin';
	}
	// Kept apart from the tier answer below: with no features `shouldGateStats` cannot tell us
	// anything, and filing that as `no_commercial_stats` would read as a site on the wrong tier.
	if ( ! hasSiteFeatures ) {
		return 'features_unavailable';
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
	// Every gate passed and another notice in the group outranked the invitation. Last, so the
	// count is of sites that would otherwise have seen it.
	if ( suppressedBy ) {
		return 'suppressed';
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
	hasSiteFeatures,
	hasCommercialStats,
	premiumAnalyticsDashboardUrl,
	isVip,
	isP2,
	isPremiumAnalyticsEnabled,
	isStatusError,
	suppressedBy,
}: NotShownSignals ) {
	useEffect( () => {
		// The flag is off everywhere the preview has not reached yet, so counting those sites would
		// record one event per Traffic mount across all of WordPress.com and say only which build
		// we are in.
		if ( ! config.isEnabled( PREMIUM_ANALYTICS_PREVIEW_FLAG ) ) {
			return;
		}

		if ( ! siteId || ! isSettled || recordedSiteIds.has( siteId ) ) {
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
			hasSiteFeatures,
			hasCommercialStats,
			premiumAnalyticsDashboardUrl,
			isVip,
			isP2,
			isPremiumAnalyticsEnabled,
			isStatusError,
			suppressedBy,
		} );

		// Marked before the shown case returns, so a site that was offered the invitation stays out
		// of the count when a later dismissal or acceptance changes the answer.
		recordedSiteIds.add( siteId );

		if ( ! reason ) {
			return;
		}

		trackPremiumAnalyticsPreviewEvent( 'notice', 'not_shown', siteId, {
			reason,
			...( reason === 'suppressed' ? { by: suppressedBy } : {} ),
		} );
	}, [
		siteId,
		isWpcom,
		isSettled,
		isServerVisible,
		canManageOptions,
		hasSiteFeatures,
		hasCommercialStats,
		premiumAnalyticsDashboardUrl,
		isVip,
		isP2,
		isPremiumAnalyticsEnabled,
		isStatusError,
		suppressedBy,
	] );
}
