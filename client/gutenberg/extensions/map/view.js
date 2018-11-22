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
		apiFetch( { path: '/jetpack/v4/service-api-keys/mapbox' } ).then( result => {
			frontendManagement.blockIterator( document, [
				{
					component: component,
					options: {
						settings,
						props: { apiKey: result.service_api_key },
					},
				},
			] );
		} );
	} );
