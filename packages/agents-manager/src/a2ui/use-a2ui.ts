import { useEffect, useMemo, useState } from '@wordpress/element';
import { getA2uiBatches } from './a2ui-messages';
import type { A2uiRuntime } from './runtime';
import type { UIMessage } from '@automattic/agenttic-client';

interface Options {
	messages: UIMessage[];
	conversationId: string;
	isProcessing: boolean;
}

/**
 * Applies completed chat batches once to a conversation's SDK runtime, preserving edits
 * across appends and replaying changed history without introducing another message store.
 */
export default function useA2ui( options: Options ) {
	const [ sdk, setSdk ] = useState< typeof import( '.' ) >();
	const [ revision, refresh ] = useState( 0 );
	const batches = useMemo( () => getA2uiBatches( options.messages ), [ options.messages ] );
	const hasBatches = batches.length > 0;
	const session = useMemo(
		() => ( {
			conversationId: options.conversationId,
			runtime: undefined as A2uiRuntime | undefined,
			applied: [] as string[],
		} ),
		[ options.conversationId ]
	);
	useEffect( () => {
		if ( ! hasBatches || sdk ) {
			return;
		}
		let active = true;
		void import( /* webpackChunkName: "am-a2ui" */ '.' ).then(
			( module ) => active && setSdk( module ),
			() => {}
		);
		return () => {
			active = false;
		};
	}, [ hasBatches, sdk ] );
	useEffect( () => {
		return () => {
			session.runtime?.dispose();
			session.runtime = undefined;
			session.applied = [];
		};
	}, [ session ] );
	useEffect( () => {
		if ( ! sdk || options.isProcessing ) {
			return;
		}
		if (
			session.applied.some( ( signature, index ) => signature !== batches[ index ]?.signature )
		) {
			session.runtime?.dispose();
			session.runtime = undefined;
			session.applied = [];
		}
		if ( batches.length > 0 && ! session.runtime ) {
			session.runtime = sdk.createA2uiRuntime( async () => {} );
		}
		try {
			for ( const batch of batches.slice( session.applied.length ) ) {
				session.runtime?.processMessages( batch.operations, batch.messageId );
			}
		} catch {
			session.runtime?.dispose();
			session.runtime = undefined;
		}
		session.applied = batches.map( ( batch ) => batch.signature );
		refresh( ( value ) => value + 1 );
	}, [ batches, options.isProcessing, sdk, session ] );
	const runtime = session.runtime;
	const isDisabled = options.isProcessing;
	return useMemo(
		() => ( { runtime, sdk, revision, isDisabled } ),
		[ runtime, sdk, revision, isDisabled ]
	);
}

export type A2uiPresentation = ReturnType< typeof useA2ui >;
