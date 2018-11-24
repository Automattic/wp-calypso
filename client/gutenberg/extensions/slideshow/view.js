/** @format */

/**
 * Internal dependencies
 */

import './style.scss';
import component from './component.js';
import { settings } from './settings.js';
import FrontendManagement from 'gutenberg/extensions/shared/frontend-management.js';

window &&
	window.addEventListener( 'load', function() {
		const frontendManagement = new FrontendManagement();
		frontendManagement.blockIterator( document, [
			{
				component: component,
				options: {
					settings,
				},
			},
		] );
	} );
