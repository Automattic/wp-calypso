/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import ThemesList from './src/themes-list';

const opts = window.witScriptFseThemesData;

const FSE_Themes = () => {
	return (
		<>
			<h1>Themes</h1>
			<ThemesList themes={ opts.themes } />
		</>
	);
};

domReady( () => {
	render( <FSE_Themes />, document.getElementById( 'wit-root' ) );
} );
