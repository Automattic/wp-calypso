import { useCallback, useEffect, useRef } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch } from 'calypso/state';
import { activatePlugin, fetchSitePlugins } from 'calypso/state/plugins/installed/actions';

const POLL_INTERVAL_MS = 3000;
// Activation retries back off from the poll cadence up to this ceiling; the caller's activation
// deadline is what ends them.
const ACTIVATION_RETRY_MAX_MS = 30000;

// The Atomic transfer reports complete once the plugin's install+activate job is queued on the new
// host, not once it has run, and the site's plugin list stays unreachable until Jetpack has synced.
// Poll the list until the plugin shows up active; nudge it active ourselves as a fallback for a job
// that never lands. Both the listing and the nudge happen as soon as they can, not on the next tick.
export function usePostTransferPluginRecovery( {
	siteId,
	enabled,
	canActivate,
	ownsActivation,
	installedPlugin,
}: {
	siteId: number;
	enabled: boolean;
	canActivate: boolean;
	ownsActivation: boolean;
	installedPlugin: { slug?: string; id?: string } | null | undefined;
} ): void {
	const dispatch = useDispatch();
	const attemptsRef = useRef( 0 );
	const inFlightRef = useRef( false );
	const retryAfterRef = useRef( 0 );
	const pluginId = installedPlugin?.id;
	const pluginSlug = installedPlugin?.slug;

	const activateIfReady = useCallback( () => {
		// Gate activation on: the transfer being usable (capability gap); this hook owning activation
		// (the step-driven flow owns it otherwise); one settled attempt at a time; the backoff.
		if (
			! canActivate ||
			! ownsActivation ||
			! pluginId ||
			inFlightRef.current ||
			Date.now() < retryAfterRef.current
		) {
			return;
		}

		const attempt = attemptsRef.current;
		attemptsRef.current += 1;
		retryAfterRef.current =
			Date.now() + Math.min( POLL_INTERVAL_MS * 2 ** attempt, ACTIVATION_RETRY_MAX_MS );
		inFlightRef.current = true;
		Promise.resolve(
			dispatch( activatePlugin( siteId, { slug: pluginSlug, id: pluginId } ) )
		).finally( () => {
			inFlightRef.current = false;
			// Refresh right away so the now-active plugin is observed immediately, rather than waiting
			// for the next poll — the caller's redirect is gated on that active state.
			dispatch( fetchSitePlugins( siteId ) );
		} );
	}, [ canActivate, ownsActivation, pluginId, pluginSlug, siteId, dispatch ] );

	useEffect( () => {
		if ( enabled ) {
			dispatch( fetchSitePlugins( siteId ) );
		}
	}, [ enabled, siteId, dispatch ] );

	useEffect( () => {
		if ( enabled ) {
			activateIfReady();
		}
	}, [ enabled, activateIfReady ] );

	useInterval(
		() => {
			dispatch( fetchSitePlugins( siteId ) );
			activateIfReady();
		},
		enabled ? POLL_INTERVAL_MS : null
	);
}
