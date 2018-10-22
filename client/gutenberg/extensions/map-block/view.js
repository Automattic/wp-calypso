/** @format */

/**
 * Internal dependencies
 */

import './style.scss';
import component from './component.js';
import { settings } from './settings.js';
import FrontendManagement from 'gutenberg/extensions/shared/atavist/frontend-management.js';

window.addEventListener( 'load', function() {
	// Do not initialize in editor.
	if ( window.wp.editor ) {
		return;
	}
	const frontendManagement = new FrontendManagement();
	frontendManagement.blockIterator( document, [
		{
			component: component,
			options: { settings },
		},
	] );
} );
