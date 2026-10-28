import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import {
	getDroppedShowComponentMessages,
	getShowComponentIdentity,
} from '../utils/show-component-tools';
import type { AgentsManagerUIMessage } from '../utils/convert-tool-messages-to-components';
import type { UIMessage } from '@automattic/agenttic-client';

interface UseShowComponentRetentionOptions {
	messages: UIMessage[];
	isProcessing: boolean;
}

/**
 * Keeps show-component messages (pickers and other interactive components) on
 * screen when Agenttic briefly drops UI-only messages mid-stream, and keeps
 * them all in the order they first appeared.
 *
 * A regeneration deliberately drops the component it replaces (Agenttic sends
 * `preserveUiOnlyMessages: false`), so `pauseRetentionForRegeneration()` pauses retention
 * until that turn settles. A history load replaces the transcript, so `expectHistoryLoad()`
 * resets retention across it.
 */
export function useShowComponentRetention( {
	messages,
	isProcessing,
}: UseShowComponentRetentionOptions ) {
	const [ retainedMessages, setRetainedMessages ] = useState< Map< string, UIMessage > >(
		new Map()
	);
	const [ isRegenerating, setIsRegenerating ] = useState( false );
	const previousMessagesRef = useRef( messages );
	const orderByIdentityRef = useRef< Map< string, number > >( new Map() );
	const nextOrderRef = useRef( 0 );
	const wasProcessingRef = useRef( isProcessing );
	const isHistoryLoadExpectedRef = useRef( false );

	// Keeps the map reference when already empty, so no re-render is triggered.
	const clearRetainedMessages = useCallback( () => {
		setRetainedMessages( ( previousRetainedMessages ) =>
			previousRetainedMessages.size > 0 ? new Map() : previousRetainedMessages
		);
	}, [] );

	// A regeneration is finished once its turn settles — either the new response
	// arrives or an error restores the previous one.
	useEffect( () => {
		const wasProcessing = wasProcessingRef.current;
		wasProcessingRef.current = isProcessing;

		if ( isRegenerating && wasProcessing && ! isProcessing ) {
			setIsRegenerating( false );
		}
	}, [ isProcessing, isRegenerating ] );

	const getShowComponentOrder = useCallback( ( message: UIMessage ): number | undefined => {
		const identity = getShowComponentIdentity( message );
		if ( ! identity ) {
			return undefined;
		}

		const existingOrder = orderByIdentityRef.current.get( identity );
		if ( existingOrder !== undefined ) {
			return existingOrder;
		}

		const nextOrder = nextOrderRef.current++;
		orderByIdentityRef.current.set( identity, nextOrder );
		return nextOrder;
	}, [] );

	useEffect( () => {
		const previousMessages = previousMessagesRef.current;
		previousMessagesRef.current = messages;

		// A history load, or clearing the chat, replaces the transcript. A loaded picker
		// can carry another identity than its live copy, so retaining across it would
		// show it twice.
		const previousMessageIds = new Set( previousMessages.map( ( message ) => message.id ) );
		const isHistoryReplaced =
			isHistoryLoadExpectedRef.current ||
			( previousMessages.length > 0 &&
				! messages.some( ( message ) => previousMessageIds.has( message.id ) ) );

		isHistoryLoadExpectedRef.current = false;

		if ( isHistoryReplaced ) {
			clearRetainedMessages();
			return;
		}

		if ( isRegenerating ) {
			return;
		}

		// Records each component's first-seen order, so a restored copy sorts back into place.
		messages.forEach( getShowComponentOrder );

		const droppedMessages = getDroppedShowComponentMessages( previousMessages, messages );
		if ( droppedMessages.length === 0 ) {
			return;
		}

		setRetainedMessages( ( previousRetainedMessages ) => {
			const nextRetainedMessages = new Map( previousRetainedMessages );
			let hasChanged = false;

			for ( const message of droppedMessages ) {
				// One placeholder per identity, so a component that drops and returns
				// refreshes in place instead of stacking another copy.
				const retainedId = `retained-${ getShowComponentIdentity( message ) }`;
				if ( ! nextRetainedMessages.has( retainedId ) ) {
					nextRetainedMessages.set( retainedId, { ...message, id: retainedId } );
					hasChanged = true;
				}
			}

			return hasChanged ? nextRetainedMessages : previousRetainedMessages;
		} );
	}, [ clearRetainedMessages, getShowComponentOrder, messages, isRegenerating ] );

	// Called before a history load, since loaded messages keep their IDs and can't show it.
	const expectHistoryLoad = useCallback( () => {
		isHistoryLoadExpectedRef.current = true;
	}, [] );

	// Clears the retained copies up front: the turn is being rewound, so a
	// leftover picker would reappear if the new response omits the component.
	const pauseRetentionForRegeneration = useCallback( () => {
		setIsRegenerating( true );
		clearRetainedMessages();
	}, [ clearRetainedMessages ] );

	// Adds the retained copies of dropped components back, in their first-seen order.
	const withRetainedShowComponents = useCallback(
		( currentMessages: AgentsManagerUIMessage[] ): AgentsManagerUIMessage[] => {
			currentMessages.forEach( getShowComponentOrder );

			const messagesToRestore = getDroppedShowComponentMessages(
				[ ...retainedMessages.values() ],
				currentMessages
			);
			if ( messagesToRestore.length === 0 ) {
				return currentMessages;
			}

			messagesToRestore.forEach( getShowComponentOrder );

			return [ ...currentMessages, ...messagesToRestore ].sort( ( messageA, messageB ) => {
				const orderA = getShowComponentOrder( messageA );
				const orderB = getShowComponentOrder( messageB );
				if ( orderA !== undefined && orderB !== undefined && orderA !== orderB ) {
					return orderA - orderB;
				}

				return ( messageA.timestamp ?? 0 ) - ( messageB.timestamp ?? 0 );
			} );
		},
		[ getShowComponentOrder, retainedMessages ]
	);

	return { pauseRetentionForRegeneration, withRetainedShowComponents, expectHistoryLoad };
}
