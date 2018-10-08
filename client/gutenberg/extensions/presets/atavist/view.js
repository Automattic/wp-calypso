/**
 * Internal dependencies
 */

import FrontendManagement from 'gutenberg/extensions/shared/atavist/frontend-management.js';
import { map } from 'gutenberg/extensions/map-block/view';

const navigationTypes = [];
const blocks = [
	{
		component: map.component,
		options: {
			config: map.CONFIG,
			selector: '.map__map-container'
		}
	}
];

const init = function() {
	const frontendManagement = new FrontendManagement();
	document.querySelector('body').classList.add('webcomponentsready');
	frontendManagement.blockIterator( document, navigationTypes );
	frontendManagement.blockIterator( document, blocks );
};

window.addEventListener( 'load', init );
