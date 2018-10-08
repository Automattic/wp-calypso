/**
 * Internal dependencies
 */

import FrontendManagement from 'gutenberg/extensions/shared/atavist/frontend-management.js';
import { navigationFlag } from 'gutenberg/extensions/navigation-flag/view';

const navigationTypes = [
	{
		component: navigationFlag.component,
		options: {
			config: navigationFlag.CONFIG
		}
	}
];
const blocks = [];

const init = function() {
	const frontendManagement = new FrontendManagement();
	document.querySelector('body').classList.add('webcomponentsready');
	frontendManagement.blockIterator( document, navigationTypes );
	frontendManagement.blockIterator( document, blocks );
};

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

window.addEventListener( 'load', init );
window.addEventListener( 'scroll', onCover )
