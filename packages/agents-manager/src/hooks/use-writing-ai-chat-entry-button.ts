import { useEffect, useSyncExternalStore } from '@wordpress/element';

const ENTRY_SELECTOR = [
	'.agents-manager-ai-chat',
	'#wp-admin-bar-agents-manager-ai-chat',
	'.masterbar__item-agents-manager-ai-chat',
].join( ',' );
const EXTERNAL_ENTRY_SELECTOR = [
	'#wp-admin-bar-agents-manager-ai-chat',
	'.masterbar__item-agents-manager-ai-chat',
].join( ',' );

function hasWritingAiChatEntryButton(): boolean {
	return !! document.querySelector( ENTRY_SELECTOR );
}

function subscribe( notify: () => void ): () => void {
	const containsEntry = ( node: Node ): boolean =>
		node instanceof Element &&
		( node.matches( ENTRY_SELECTOR ) || !! node.querySelector( ENTRY_SELECTOR ) );
	const observer = new MutationObserver( ( mutations ) => {
		const entryChanged = mutations.some( ( mutation ) =>
			[ ...mutation.addedNodes, ...mutation.removedNodes ].some( containsEntry )
		);
		if ( entryChanged ) {
			notify();
		}
	} );
	observer.observe( document.body, { childList: true, subtree: true } );
	return () => observer.disconnect();
}

/** Detect and wire the writing entry button without Site Editor route logic. */
export default function useWritingAiChatEntryButton( onExternalEntryClick?: () => void ): boolean {
	useEffect( () => {
		if ( ! onExternalEntryClick ) {
			return;
		}

		const handleClick = ( event: MouseEvent ) => {
			if ( event.target instanceof Element && event.target.closest( EXTERNAL_ENTRY_SELECTOR ) ) {
				onExternalEntryClick();
			}
		};

		document.addEventListener( 'click', handleClick );
		return () => document.removeEventListener( 'click', handleClick );
	}, [ onExternalEntryClick ] );

	return useSyncExternalStore( subscribe, hasWritingAiChatEntryButton, () => false );
}
