/**
 * Internal dependencies
 */

import FrontendManagement from 'gutenberg/extensions/shared/atavist/frontend-management.js';
import 'gutenberg/extensions/title-design/view';
import 'gutenberg/extensions/shared/atavist/subcomponents/multi-background/style.scss';

const navigationTypes = [];
const blocks = [];

const init = function() {
	const frontendManagement = new FrontendManagement();
	document.querySelector('body').classList.add('webcomponentsready');
	frontendManagement.blockIterator( document, navigationTypes );
	frontendManagement.blockIterator( document, blocks );
};

window.addEventListener( 'load', init );
