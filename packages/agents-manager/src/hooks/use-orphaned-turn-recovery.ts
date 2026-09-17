/**
 * The panel-side half of first-message orphan recovery (WOOAI-872 /
 * WOOAI-847): hold the turns `useReconcileDeliveryStatus` recovered, retry one,
 * and dismiss them.
 *
 * Recovered turns are held here rather than loaded into the chat. Handing them
 * to the agent would persist them under whatever session the panel currently
 * holds and replay them with the next turn, duplicating a conversation the
 * merchant never reopened. Retry re-sends the text as a fresh turn, so nothing
 * downstream needs them in history.
 */
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import useReconcileDeliveryStatus, { type OrphanedTurn } from './use-reconcile-delivery-status';

export type { OrphanedTurn };

interface Options {
	/** Sends the prompt; resolves to whether it actually dispatched. */
	sendRetry: ( text: string ) => Promise< boolean >;
}

export interface OrphanedTurnRecovery {
	failedRetries: OrphanedTurn[];
	handleRetryFailed: ( turn: OrphanedTurn ) => Promise< void >;
	dismissRecovery: () => void;
}

export default function useOrphanedTurnRecovery( { sendRetry }: Options ): OrphanedTurnRecovery {
	const reconcileResult = useReconcileDeliveryStatus();
	const [ failedRetries, setFailedRetries ] = useState< OrphanedTurn[] >( [] );
	const dismissedRef = useRef( false );

	useEffect( () => {
		// Reconciliation can settle after the chat was cleared. The dismissal is
		// final: the merchant asked for a blank panel, not for the recovered
		// question to reappear a moment later.
		if ( dismissedRef.current ) {
			return;
		}
		setFailedRetries( reconcileResult ?? [] );
	}, [ reconcileResult ] );

	const dismissRecovery = useCallback( () => {
		dismissedRef.current = true;
		setFailedRetries( [] );
	}, [] );

	const handleRetryFailed = useCallback(
		async ( turn: OrphanedTurn ) => {
			setFailedRetries( ( previous ) => previous.filter( ( retry ) => retry.id !== turn.id ) );

			if ( await sendRetry( turn.text ) ) {
				return;
			}

			// The send never left: put the question back so it is not lost twice.
			setFailedRetries( ( previous ) =>
				previous.some( ( retry ) => retry.id === turn.id ) ? previous : [ ...previous, turn ]
			);
		},
		[ sendRetry ]
	);

	return { failedRetries, handleRetryFailed, dismissRecovery };
}
