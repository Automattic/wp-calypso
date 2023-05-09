import { select, subscribe } from '@wordpress/data';

const isEditorReady = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			// Calypso sends the message as soon as the iframe is loaded, so we
			// need to be sure that the editor is initialized and the core blocks
			// registered. There is an unstable selector for that, so we use
			// `isCleanNewPost` otherwise which is triggered when everything is
			// initialized if the post is new.
			const editorIsReady = select( 'core/editor' ).__unstableIsEditorReady
				? select( 'core/editor' ).__unstableIsEditorReady()
				: select( 'core/editor' ).isCleanNewPost();
			if ( editorIsReady ) {
				unsubscribe();
				resolve();
			}
		} );
	} );

/**
 * The gutenberg block editor preview button opens a new window to a simple site's mapped
 * domain.
 * Adds logmein query param to editor draft post preview url to add WordPress cookies in
 * a first party context ( allowing us to avoid third party cookie issues )
 */
async function overridePreviewButtonUrl() {
	await isEditorReady();

	// Tracks when a popover is introduced into the post editor DOM
	const popoverSlotObserver = new window.MutationObserver( ( mutations ) => {
		const isComponentsPopover = ( node ) => node.classList.contains( 'components-popover' );

		for ( const record of mutations ) {
			for ( const node of record.addedNodes ) {
				if ( isComponentsPopover( node ) ) {
					const previewButton = node.querySelector( 'a[href$="preview=true"]' );
					// Disables default onclick behavior for the preview button and replaces
					// it with our own window opening logic. Overriding the href directly
					// doesn't work because the custom href we apply is overridden somewhere
					// upstream.

					if ( previewButton ) {
						previewButton.onclick = function ( e ) {
							e.preventDefault();
							e.stopPropagation();
							window.open( `${ previewButton.href }&logmein=direct` );
						};
					}
				}
			}
		}
	} );

	const popoverSlotElem = document.querySelector( '.interface-interface-skeleton ~ .popover-slot' );
	popoverSlotObserver.observe( popoverSlotElem, { childList: true } );
}

overridePreviewButtonUrl();
