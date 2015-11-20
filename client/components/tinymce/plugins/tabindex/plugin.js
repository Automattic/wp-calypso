/**
 * External dependencies
 */
import tinymce from 'tinymce/tinymce';

function plugin( editor ) {
	const tabindex = editor.settings.tabindex;
	if ( ! Number.isFinite( tabindex ) || tabindex < 0 || tabindex > 32767 ) {
		return;
	}

	editor.on( 'PostRender', () => {
		const iframe = document.getElementById( editor.id + '_ifr' );
		if ( ! iframe ) {
			return;
		}

		iframe.setAttribute( 'tabindex', tabindex );
	} );
}

export default function() {
	tinymce.PluginManager.add( 'wpcom/tabindex', plugin );
};
