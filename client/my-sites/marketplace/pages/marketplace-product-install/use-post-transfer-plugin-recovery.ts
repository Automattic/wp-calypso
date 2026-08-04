import { useRef } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch, useStore } from 'calypso/state';
import { activatePlugin, fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { isPluginActive } from 'calypso/state/plugins/installed/selectors-ts';

const POLL_INTERVAL_MS = 3000;
const MAX_ACTIVATION_ATTEMPTS = 3;

// The Atomic transfer can report complete before the checkout-installed plugin is activated, leaving it
// installed but inactive. Poll the plugin list and nudge it active; that flips `pluginActive`, which the
// caller's redirect watches for and which disables this hook. If activation never lands the poll keeps
// running, so a late backend activation is still caught.
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
	installedPlugin: { slug?: string; id?: string; active?: boolean } | null | undefined;
} ): void {
	const dispatch = useDispatch();
	const store = useStore();
	const attemptsRef = useRef( 0 );
	const inFlightRef = useRef( false );

	useInterval(
		() => {
			const refreshed = Promise.resolve( dispatch( fetchSitePlugins( siteId ) ) );

			// Gate activation on: the transfer being usable (capability gap); this hook owning activation
			// (the step-driven flow owns it otherwise); one settled attempt at a time; a bounded budget.
			// Checked now rather than after the refresh, so a flow that has moved on in the meantime does
			// not get an activation it no longer owns.
			if (
				! canActivate ||
				! ownsActivation ||
				! installedPlugin?.id ||
				inFlightRef.current ||
				attemptsRef.current >= MAX_ACTIVATION_ATTEMPTS
			) {
				return;
			}

			const { slug } = installedPlugin;
			inFlightRef.current = true;
			refreshed
				.then( () => {
					// Decide from the refreshed list read straight off the store, not from the props this
					// tick closed over. An endpoint that cannot report the benign already-active case
					// answers a redundant activation with a plain failure, which leaves `active` false in
					// the store — so props alone would have this poll spend its whole budget re-activating
					// a plugin the refresh has already shown to be active.
					if ( ! slug || isPluginActive( store.getState(), siteId, slug ) ) {
						return;
					}

					attemptsRef.current += 1;
					// Hand over the plugin as the store has it rather than a slug/id pair, so
					// activatePlugin can apply its own already-active guard too.
					return Promise.resolve( dispatch( activatePlugin( siteId, installedPlugin ) ) ).finally(
						() =>
							// Refresh right away so the now-active plugin is observed immediately, rather than
							// waiting for the next poll — the caller's redirect is gated on that active state.
							dispatch( fetchSitePlugins( siteId ) )
					);
				} )
				.finally( () => {
					inFlightRef.current = false;
				} );
		},
		enabled ? POLL_INTERVAL_MS : null
	);
}
