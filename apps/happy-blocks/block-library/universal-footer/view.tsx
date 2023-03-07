import { PureUniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import domReady from '@wordpress/dom-ready';
import { hydrate } from 'react-dom';

domReady( () => {
	document.querySelectorAll( `.wp-block-happy-blocks-universal-footer` ).forEach( ( el ) => {
		hydrate( <PureUniversalNavbarFooter />, el );
	} );
} );
