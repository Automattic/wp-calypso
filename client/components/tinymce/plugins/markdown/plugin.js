/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';

/**
 * TinyMCE plugin tweaking Markdown behaviour.
 *
 * @param {Object} editor TinyMCE editor instance
 */
function markdown( editor ) {
	function allowMarkdownAttribute( event ) {
		const ed = event.target;
		Object.keys( ed.schema.elements ).forEach( function( key ) {
			if ( typeof ed.schema.elements[ key ].attributes.markdown === 'undefined' ) {
				ed.schema.elements[ key ].attributes.markdown = {};
				ed.schema.elements[ key ].attributesOrder.push( 'markdown' );
			}
		} );
	}

	editor.on( 'BeforeSetContent', allowMarkdownAttribute );
}

export default function() {
	tinymce.PluginManager.add( 'wpcom/markdown', markdown );
}
