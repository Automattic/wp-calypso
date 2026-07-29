import { useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch } from 'calypso/state';
import { activatePlugin, fetchSitePlugins } from 'calypso/state/plugins/installed/actions';

export const PLUGIN_POLL_INTERVAL_MS = 3000;
const MAX_ACTIVATION_ATTEMPTS = 3;

export type PluginRecoveryProgress = {
	/** Plugin-list requests that have come back. Requests are serialized, so this counts rounds. */
	completedPolls: number;
	/** A plugin-list request is outstanding: what the list says now may be about to change. */
	pollInFlight: boolean;
	/** Activation was tried as often as it is going to be, and nothing is still in flight. */
	activationExhausted: boolean;
};

// The Atomic transfer can report complete before the checkout-installed plugin is activated, leaving it
// installed but inactive. Poll the plugin list and nudge it active; that flips `pluginActive`, which the
// caller's redirect watches for and which disables this hook. If activation never lands the poll keeps
// running, so a late backend activation is still caught.
//
// Reports its own progress so the caller can wait on rounds of polling rather than on a clock that
// knows nothing about the requests it is racing.
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
} ): PluginRecoveryProgress {
	const dispatch = useDispatch();
	const attemptsRef = useRef( 0 );
	const activatingRef = useRef( false );
	const pollingRef = useRef( false );
	const [ completedPolls, setCompletedPolls ] = useState( 0 );
	const [ pollInFlight, setPollInFlight ] = useState( false );
	const [ activationExhausted, setActivationExhausted ] = useState( false );

	// One request at a time, so a round of polling means a list that answers for the round — and so a
	// slow response cannot be overtaken by a later one that settles first.
	const pollPlugins = useCallback( () => {
		if ( pollingRef.current ) {
			return;
		}
		pollingRef.current = true;
		setPollInFlight( true );
		Promise.resolve( dispatch( fetchSitePlugins( siteId ) ) ).finally( () => {
			pollingRef.current = false;
			setPollInFlight( false );
			setCompletedPolls( ( count ) => count + 1 );
		} );
	}, [ dispatch, siteId ] );

	// The interval only fires after its first delay, and the transfer has already kept the customer
	// waiting; look once as soon as there is a reason to.
	useEffect( () => {
		if ( enabled ) {
			pollPlugins();
		}
	}, [ enabled, pollPlugins ] );

	useInterval(
		() => {
			pollPlugins();

			// Gate activation on: the transfer being usable (capability gap); this hook owning activation
			// (the step-driven flow owns it otherwise); one settled attempt at a time; a bounded budget.
			if (
				! canActivate ||
				! ownsActivation ||
				! installedPlugin?.id ||
				activatingRef.current ||
				attemptsRef.current >= MAX_ACTIVATION_ATTEMPTS
			) {
				return;
			}

			attemptsRef.current += 1;
			activatingRef.current = true;
			Promise.resolve(
				dispatch( activatePlugin( siteId, { slug: installedPlugin.slug, id: installedPlugin.id } ) )
			).finally( () => {
				activatingRef.current = false;
				setActivationExhausted( attemptsRef.current >= MAX_ACTIVATION_ATTEMPTS );
				// Refresh right away so the now-active plugin is observed immediately, rather than waiting
				// for the next poll — the caller's redirect is gated on that active state.
				pollPlugins();
			} );
		},
		enabled ? PLUGIN_POLL_INTERVAL_MS : null
	);

	return { completedPolls, pollInFlight, activationExhausted };
}
