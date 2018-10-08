/**
 * Internal dependencies
 */

import FrontendManagement from 'gutenberg/extensions/shared/atavist/frontend-management.js';
import { map } from 'gutenberg/extensions/map/view';
import { navigation } from 'gutenberg/extensions/navigation/view';

const navigationTypes = [
	{
		component: navigation.component,
		options: {
			config: navigation.CONFIG,
		}
	}
];
const blocks = [
	{
		component: map.component,
		options: {
			config: map.CONFIG
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
