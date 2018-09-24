/**
 * Internal dependencies
 */

import 'gutenberg/extensions/map/style.scss';
import 'gutenberg/extensions/title-design/style.scss';
import Map from 'gutenberg/extensions/map/Map.js';
import FrontendManagement from 'gutenberg/extensions/shared/atavist/FrontendManagement.js';

const navigationTypes = [];
const blocks = [
	{
		component: Map,
		options: {
			selector: '.map__map-container'
		}
	}
];

const onCover = function() {
	let isOnCover = false;
	const title_design = document.querySelector('div[data-atavist_title_design="1"]:first-of-type');
 	if ( title_design ) {
 		const rect = title_design.getBoundingClientRect();
 		const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
 		isOnCover = !(rect.bottom < 0 || rect.top - viewHeight >= 0);
 	}
 	document.body.classList.toggle( 'on-cover', isOnCover );
};

const init = function() {
	const frontendManagement = new FrontendManagement();
	document.querySelector('body').classList.add('webcomponentsready')
	frontendManagement.blockIterator( document, navigationTypes );
	frontendManagement.blockIterator( document, blocks );
	onCover();
};

window.onscroll = onCover;
window.onload = init;
