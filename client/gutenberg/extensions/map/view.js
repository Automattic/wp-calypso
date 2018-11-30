/** @format */

/**
 * Internal dependencies
 */

import './style.scss';
import component from './component.js';
import { settings } from './settings.js';
import FrontendManagement from 'gutenberg/extensions/shared/frontend-management.js';
import apiFetch from '@wordpress/api-fetch';

window &&
	window.addEventListener( 'load', function() {
		const frontendManagement = new FrontendManagement();
		// add api-key to arributes so FrontendManagement knows about it.
		//  it is dynamically being added on the php side
		const apiKey = {
			type: 'string',
			default: '',
		};
		settings.attributes = { ...settings.attributes, apiKey };
		frontendManagement.blockIterator( document, [
			{
				component: component,
				options: {
					settings,
				},
			},
		] );
	} );
