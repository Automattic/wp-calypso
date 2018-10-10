/** @format */

/**
 * Internal dependencies
 */

import './style.scss';
import component from './map-component.js';
import { CONFIG } from './config.js';
import FrontendManagement from 'gutenberg/extensions/shared/atavist/frontend-management.js';

window.addEventListener( 'load', function() {
	const frontendManagement = new FrontendManagement();
	frontendManagement.blockIterator(
		document,
		[
			{
				component: component,
				options: {
					config: CONFIG,
					selector: '.map__map-container'
				}
			}
		]
	);
} );
