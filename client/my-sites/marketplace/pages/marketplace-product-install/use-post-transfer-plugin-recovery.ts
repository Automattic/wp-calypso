import { useCallback, useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch } from 'calypso/state';
import {
	activatePlugin,
	fetchSitePlugins,
	installPlugin,
} from 'calypso/state/plugins/installed/actions';

const POLL_INTERVAL_MS = 3000;
// Activation retries back off from the poll cadence up to this ceiling; the caller's activation
// deadline is what ends them.
const ACTIVATION_RETRY_MAX_MS = 30000;
// How long the plugin may stay absent from a usable site before it is reinstalled from here. The
// transfer's own install job normally lands within seconds of the site becoming usable.
const REINSTALL_AFTER_ABSENT_MS = 30000;

// The Atomic transfer reports complete once the plugin's install+activate job is queued on the new
// host, not once it has run, and the site's plugin list stays unreachable until Jetpack has synced.
// Poll the list until the plugin shows up active; nudge it active ourselves as a fallback for a job
// that never lands. Both the listing and the nudge happen as soon as they can, not on the next tick.
// A transfer can also complete without installing the plugin at all; once the site has been usable
// for a while with the plugin still absent, install it from here, once.
export function usePostTransferPluginRecovery( {
	siteId,
	enabled,
	canActivate,
	ownsActivation,
	installedPlugin,
	reinstallSlug = null,
}: {
	siteId: number;
	enabled: boolean;
	canActivate: boolean;
	ownsActivation: boolean;
	installedPlugin: { slug?: string; id?: string } | null | undefined;
	/** The wordpress.org slug to install if the transfer dropped the plugin; null when there is none. */
	reinstallSlug?: string | null;
} ): void {
	const dispatch = useDispatch();
	const attemptsRef = useRef( 0 );
	const inFlightRef = useRef( false );
	const retryAfterRef = useRef( 0 );
	const absentSinceRef = useRef( 0 );
	const reinstalledRef = useRef( false );
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

	const reinstallIfMissing = useCallback( () => {
		if ( pluginId ) {
			absentSinceRef.current = 0;
			return;
		}
		if ( ! canActivate || ! ownsActivation || ! reinstallSlug || reinstalledRef.current ) {
			return;
		}
		if ( ! absentSinceRef.current ) {
			absentSinceRef.current = Date.now();
			return;
		}
		if ( inFlightRef.current || Date.now() - absentSinceRef.current < REINSTALL_AFTER_ABSENT_MS ) {
			return;
		}

		reinstalledRef.current = true;
		inFlightRef.current = true;
		recordTracksEvent( 'calypso_marketplace_install_plugin_reinstall', {
			site_id: siteId,
			plugin_slug: reinstallSlug,
		} );
		// installPlugin activates as part of the install, so a success needs no nudge from above.
		Promise.resolve( dispatch( installPlugin( siteId, { slug: reinstallSlug } ) ) )
			.catch( () => {} )
			.finally( () => {
				inFlightRef.current = false;
				dispatch( fetchSitePlugins( siteId ) );
			} );
	}, [ canActivate, ownsActivation, pluginId, reinstallSlug, siteId, dispatch ] );

	useEffect( () => {
		if ( enabled ) {
			dispatch( fetchSitePlugins( siteId ) );
		}
	}, [ enabled, siteId, dispatch ] );

	useEffect( () => {
		if ( enabled ) {
			activateIfReady();
			reinstallIfMissing();
		}
	}, [ enabled, activateIfReady, reinstallIfMissing ] );

	useInterval(
		() => {
			dispatch( fetchSitePlugins( siteId ) );
			activateIfReady();
			reinstallIfMissing();
		},
		enabled ? POLL_INTERVAL_MS : null
	);
}
