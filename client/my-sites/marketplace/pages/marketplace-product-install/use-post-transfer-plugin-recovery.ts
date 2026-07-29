import { useCallback, useEffect, useRef, useState } from 'react';
import { useInterval } from 'calypso/lib/interval';
import { useDispatch } from 'calypso/state';
import { activatePlugin, fetchSitePlugins } from 'calypso/state/plugins/installed/actions';

const PLUGIN_POLL_INTERVAL_MS = 3000;
const MAX_ACTIVATION_ATTEMPTS = 3;
// Rounds in which the site reported its plugins without the expected one turning up.
const MAX_EMPTY_ROUNDS = 5;
// Rounds whose request failed, which say nothing about what is installed but cannot go on forever.
const MAX_FAILED_ROUNDS = 5;

/** `searching` while there is still something to wait for; `exhausted` once there is not. */
export type PluginRecoveryStatus = 'searching' | 'exhausted';

// The Atomic transfer can report complete before the plugin is activated, leaving it installed but
// inactive. Poll the plugin list and nudge it active; that flips `pluginActive`, which the caller's
// redirect watches for and which disables this hook.
//
// One cycle at a time, and activation and its refresh belong to the same cycle: a list read taken
// while an activation is in flight answers for a moment that has already passed.
export function usePostTransferPluginRecovery( {
	siteId,
	enabled,
	runImmediately,
	canActivate,
	ownsActivation,
	installedPlugin,
}: {
	siteId: number;
	enabled: boolean;
	/** Look once on becoming enabled, for a flow whose plugin should already be there to find. */
	runImmediately: boolean;
	canActivate: boolean;
	ownsActivation: boolean;
	installedPlugin: { slug?: string; id?: string } | null | undefined;
} ): PluginRecoveryStatus {
	const dispatch = useDispatch();
	const attemptsRef = useRef( 0 );
	const inFlightRef = useRef( false );
	const [ emptyRounds, setEmptyRounds ] = useState( 0 );
	const [ failedRounds, setFailedRounds ] = useState( 0 );
	const [ busy, setBusy ] = useState( false );
	const [ activationExhausted, setActivationExhausted ] = useState( false );

	// Read through a ref so that the plugin a cycle acts on cannot, by changing this callback's
	// identity, re-arm the effect below and start cycles off the interval's schedule.
	const cycleInputs = useRef( { canActivate, ownsActivation, installedPlugin } );
	cycleInputs.current = { canActivate, ownsActivation, installedPlugin };

	const runCycle = useCallback( () => {
		if ( inFlightRef.current ) {
			return;
		}

		const {
			canActivate: ready,
			ownsActivation: owns,
			installedPlugin: plugin,
		} = cycleInputs.current;
		// Activation is gated on: the transfer being usable (capability gap); this hook owning
		// activation (another flow owns it otherwise); a plugin to act on; a bounded budget.
		const activating =
			ready && owns && !! plugin?.id && attemptsRef.current < MAX_ACTIVATION_ATTEMPTS;

		inFlightRef.current = true;
		setBusy( true );

		if ( activating ) {
			attemptsRef.current += 1;
		}

		const activation =
			activating && plugin
				? Promise.resolve(
						dispatch( activatePlugin( siteId, { slug: plugin.slug, id: plugin.id } ) )
				  )
				: Promise.resolve();

		activation
			.catch( () => undefined )
			.then( () => Promise.resolve( dispatch( fetchSitePlugins( siteId ) ) ) )
			.catch( () => false )
			.then( ( listRead ) => {
				// A request that failed left the previous list in place, so it was not a look at the site.
				if ( listRead === false ) {
					setFailedRounds( ( count ) => count + 1 );
				} else {
					setEmptyRounds( ( count ) => count + 1 );
				}
			} )
			.finally( () => {
				inFlightRef.current = false;
				setBusy( false );
				if ( activating && attemptsRef.current >= MAX_ACTIVATION_ATTEMPTS ) {
					setActivationExhausted( true );
				}
			} );
	}, [ dispatch, siteId ] );

	// The interval only fires after its first delay, and a transfer has already kept the customer
	// waiting; look once straight away where the plugin should be there already. Flows whose own
	// activation window is still opening keep the delay, so this does not act ahead of them.
	useEffect( () => {
		if ( enabled && runImmediately ) {
			runCycle();
		}
	}, [ enabled, runImmediately, runCycle ] );

	useInterval( runCycle, enabled ? PLUGIN_POLL_INTERVAL_MS : null );

	// Nothing is left to wait for once the site has been read enough times without the plugin showing
	// up, or cannot be read at all. A plugin that did show up is waited on until activation has been
	// tried as often as it is going to be.
	const searched = emptyRounds >= MAX_EMPTY_ROUNDS || failedRounds >= MAX_FAILED_ROUNDS;
	const nothingLeftToTry = ! installedPlugin || activationExhausted;

	return searched && ! busy && nothingLeftToTry ? 'exhausted' : 'searching';
}
