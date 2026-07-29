import { useRef, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch } from 'calypso/state';
import { activatePlugin, fetchSitePlugins } from 'calypso/state/plugins/installed/actions';

export const PLUGIN_POLL_INTERVAL_MS = 3000;
const MAX_ACTIVATION_ATTEMPTS = 3;

// The Atomic transfer can report complete before the checkout-installed plugin is activated, leaving it
// installed but inactive. Poll the plugin list and nudge it active; that flips `pluginActive`, which the
// caller's redirect watches for and which disables this hook. If activation never lands the poll keeps
// running, so a late backend activation is still caught.
//
// Reports how many plugin-list fetches have come back, which is what tells the caller whether the list
// it is reading answers for this attempt, and when the poll has had its turns.
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
} ): { settledFetches: number } {
	const dispatch = useDispatch();
	const attemptsRef = useRef( 0 );
	const inFlightRef = useRef( false );
	const [ settledFetches, setSettledFetches ] = useState( 0 );

	const fetchPlugins = () =>
		Promise.resolve( dispatch( fetchSitePlugins( siteId ) ) ).finally( () =>
			setSettledFetches( ( count ) => count + 1 )
		);

	useInterval(
		() => {
			fetchPlugins();

			// Gate activation on: the transfer being usable (capability gap); this hook owning activation
			// (the step-driven flow owns it otherwise); one settled attempt at a time; a bounded budget.
			if (
				! canActivate ||
				! ownsActivation ||
				! installedPlugin?.id ||
				inFlightRef.current ||
				attemptsRef.current >= MAX_ACTIVATION_ATTEMPTS
			) {
				return;
			}

			attemptsRef.current += 1;
			inFlightRef.current = true;
			Promise.resolve(
				dispatch( activatePlugin( siteId, { slug: installedPlugin.slug, id: installedPlugin.id } ) )
			).finally( () => {
				inFlightRef.current = false;
				// Refresh right away so the now-active plugin is observed immediately, rather than waiting
				// for the next poll — the caller's redirect is gated on that active state.
				fetchPlugins();
			} );
		},
		enabled ? PLUGIN_POLL_INTERVAL_MS : null
	);

	return { settledFetches };
}
