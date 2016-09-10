/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';

function mentions( editor ) {

	editor.on( 'init', function() {

	} );

}

export default () => {
	tinymce.PluginManager.add( 'wpcom/mentions', mentions );
};
