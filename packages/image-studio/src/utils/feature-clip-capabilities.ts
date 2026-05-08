/**
 * Browser capability detection for the Highlights Feature Clip flow.
 *
 * The flow renders MP4 in-browser via EditFrame's `renderToVideo`, which
 * requires the WebCodecs `VideoEncoder` API, and synthesizes an audio bed
 * via `OfflineAudioContext`. Both are available in modern evergreen
 * browsers (Chrome/Edge 94+, Safari 16.4+, Firefox 130+) but absent on
 * older versions — without them the render throws partway through.
 *
 * We capability-check up front so unsupported browsers see a disabled
 * Highlights option in the picker (with a tooltip) instead of an
 * after-the-fact "Render failed" notice. The Cinematic style is
 * server-rendered (Veo) and unaffected.
 */

import { __ } from '@wordpress/i18n';

export interface FeatureClipCapabilities {
	isSupported: boolean;
	// User-readable reason rendered in the picker tooltip + the defensive
	// fallback error in FeatureClipRenderHost. Only populated when the
	// flow is unsupported.
	reason?: string;
}

let cachedCapabilities: FeatureClipCapabilities | null = null;

/**
 * Detect whether the current browser can run the Highlights flow end-to-end.
 * Memoized — the answer doesn't change for the duration of the page session.
 *
 * Uses simple `in window` checks; we intentionally don't probe
 * `VideoEncoder.isConfigSupported({ codec: 'avc1.42001E' })` for H.264
 * support specifically. That's an async probe, and the false-positive case
 * (browser exposes VideoEncoder but rejects the H.264 config) is rare
 * enough that the simple check covers ~99% of real-world traffic. We can
 * upgrade to a codec probe if telemetry shows users with `isSupported:
 * true` still hitting render failures.
 */
export function getFeatureClipCapabilities(): FeatureClipCapabilities {
	if ( cachedCapabilities ) {
		return cachedCapabilities;
	}

	if ( typeof window === 'undefined' ) {
		cachedCapabilities = { isSupported: false };
		return cachedCapabilities;
	}

	if ( ! ( 'VideoEncoder' in window ) ) {
		cachedCapabilities = {
			isSupported: false,
			reason: __(
				"Your browser doesn't support in-browser video rendering. Try the latest Chrome, Edge, Safari, or Firefox.",
				__i18n_text_domain__
			),
		};
		return cachedCapabilities;
	}

	if ( ! ( 'OfflineAudioContext' in window ) ) {
		cachedCapabilities = {
			isSupported: false,
			reason: __(
				"Your browser doesn't support audio rendering. Try the latest Chrome, Edge, Safari, or Firefox.",
				__i18n_text_domain__
			),
		};
		return cachedCapabilities;
	}

	cachedCapabilities = { isSupported: true };
	return cachedCapabilities;
}
