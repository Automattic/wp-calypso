/**
 * External dependencies
 */

import tinymce from 'tinymce/tinymce';

/**
 * TinyMCE plugin tweaking Markdown behaviour.
 *
 * @param {object} editor TinyMCE editor instance
 */
function markdown( editor ) {
	function allowMarkdownAttribute( event ) {
		const ed = event.target;
		Object.keys( ed.schema.elements ).forEach( function ( key ) {
			ed.schema.elements[ key ].attributes.markdown = {};
			ed.schema.elements[ key ].attributesOrder.push( 'markdown' );
		} );
	}

	editor.on( 'preinit', allowMarkdownAttribute );
}

export default function () {
	tinymce.PluginManager.add( 'wpcom/markdown', markdown );
}
