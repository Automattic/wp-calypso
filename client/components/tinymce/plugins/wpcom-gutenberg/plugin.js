/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import { hasGutenbergBlocks } from 'lib/formatting';

function wpcomGutenberg( editor ) {
	const VK = tinymce.util.VK;

	let contentHasGutenbergBlocks = false;

	const handleEnter = () => {
		const node = editor.selection.getNode();
		const nodeIndex = editor.dom.nodeIndex( node );
		const $node = editor.dom.$( node );
		const siblings = $node.parent().contents();

		let next = null;
		if ( nodeIndex < ( siblings.length - 1 )) {
			next = siblings[ nodeIndex + 1 ];
		}

		if ( next && next.nodeType === Node.COMMENT_NODE && next.data.indexOf( '/wp:' ) !== -1 ) {
			// TODO: Place cursor after comment node
		}
	};

	editor.on( 'SetContent', event => {
		contentHasGutenbergBlocks = hasGutenbergBlocks( event.content );
	} );

	editor.on(
		'keydown',
		event => {
			if ( contentHasGutenbergBlocks && event.keyCode === VK.ENTER && ! VK.modifierPressed( event ) ) {
				handleEnter();
			}
		},
		true
	);


}

export default function() {
	tinymce.PluginManager.add( 'wpcom/gutenberg', wpcomGutenberg );
}
