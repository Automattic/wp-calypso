import { useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch } from 'calypso/state';
import { activatePlugin, fetchSitePlugins } from 'calypso/state/plugins/installed/actions';

export const PLUGIN_POLL_INTERVAL_MS = 3000;
const MAX_ACTIVATION_ATTEMPTS = 3;

export type PluginRecoveryProgress = {
	/** Rounds in which the site actually reported its plugins. A request that failed read nothing. */
	completedPolls: number;
	/** Rounds whose request failed, which say nothing about what is installed. */
	failedPolls: number;
	/** A cycle is out: what the plugin list says now may be about to change. */
	requestInFlight: boolean;
	/** Activation was tried as often as it is going to be, and its last refresh has landed. */
	activationExhausted: boolean;
};

// The Atomic transfer can report complete before the plugin is activated, leaving it installed but
// inactive. Poll the plugin list and nudge it active; that flips `pluginActive`, which the caller's
// redirect watches for and which disables this hook.
//
// One cycle at a time, and activation and its refresh belong to the same cycle: a list read while an
// activation is in flight answers for a moment that has already passed, and two cycles at once would
// let a slower one overwrite a newer answer. Reports its own progress so the caller can wait on
// rounds of looking rather than on a clock that knows nothing about the requests it races.
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
	const inFlightRef = useRef( false );
	const [ completedPolls, setCompletedPolls ] = useState( 0 );
	const [ failedPolls, setFailedPolls ] = useState( 0 );
	const [ requestInFlight, setRequestInFlight ] = useState( false );
	const [ activationExhausted, setActivationExhausted ] = useState( false );

	const pluginId = installedPlugin?.id;
	const pluginSlug = installedPlugin?.slug;

	const runCycle = useCallback( () => {
		if ( inFlightRef.current ) {
			return;
		}

		// Activation is gated on: the transfer being usable (capability gap); this hook owning
		// activation (the step-driven flow owns it otherwise); a plugin to act on; a bounded budget.
		const activating =
			canActivate && ownsActivation && !! pluginId && attemptsRef.current < MAX_ACTIVATION_ATTEMPTS;

		inFlightRef.current = true;
		setRequestInFlight( true );

		if ( activating ) {
			attemptsRef.current += 1;
		}

		const activation = activating
			? Promise.resolve( dispatch( activatePlugin( siteId, { slug: pluginSlug, id: pluginId } ) ) )
			: Promise.resolve();

		// The refresh always follows, so an activation that worked is observed at once rather than an
		// interval later — the caller's redirect is gated on that active state.
		activation
			.catch( () => undefined )
			.then( () => Promise.resolve( dispatch( fetchSitePlugins( siteId ) ) ) )
			.catch( () => false )
			.then( ( listRead ) => {
				// A request that failed left the previous list in place. Counting it as a round of
				// looking would let a run of failures pass for a site reporting no plugin at all.
				if ( listRead === false ) {
					setFailedPolls( ( count ) => count + 1 );
				} else {
					setCompletedPolls( ( count ) => count + 1 );
				}
			} )
			.finally( () => {
				inFlightRef.current = false;
				setRequestInFlight( false );
				if ( activating && attemptsRef.current >= MAX_ACTIVATION_ATTEMPTS ) {
					setActivationExhausted( true );
				}
			} );
	}, [ canActivate, ownsActivation, pluginId, pluginSlug, dispatch, siteId ] );

	// The interval only fires after its first delay, and the transfer has already kept the customer
	// waiting; look once as soon as there is a reason to.
	useEffect( () => {
		if ( enabled ) {
			runCycle();
		}
	}, [ enabled, runCycle ] );

	useInterval( runCycle, enabled ? PLUGIN_POLL_INTERVAL_MS : null );

	return { completedPolls, failedPolls, requestInFlight, activationExhausted };
}
