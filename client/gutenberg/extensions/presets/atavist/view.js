/**
 * Internal dependencies
 */

import FrontendManagement from 'gutenberg/extensions/shared/atavist/frontend-management.js';

import 'gutenberg/extensions/map/style.scss';
import MapComponent from 'gutenberg/extensions/map/map-component.js';
import MapConfig from 'gutenberg/extensions/map/config.js';

import 'gutenberg/extensions/navigation/style.scss';
import Navigation from 'gutenberg/extensions/navigation/navigation.js';
import NavigationConfig from 'gutenberg/extensions/navigation/config.js';

const navigationTypes = [
	{
		component: Navigation,
		config: NavigationConfig,
		options: {}
	}
];
const blocks = [
	{
		component: MapComponent,
		config: MapConfig,
		options: {}
	}
];

const init = function() {
	const frontendManagement = new FrontendManagement();
	document.querySelector('body').classList.add('webcomponentsready');
	frontendManagement.blockIterator( document, navigationTypes );
	frontendManagement.blockIterator( document, blocks );
};

window.addEventListener( 'load', init );
