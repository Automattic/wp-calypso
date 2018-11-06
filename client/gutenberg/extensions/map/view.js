/** @format */

/**
 * Internal dependencies
 */

import './style.scss';
/* TODO: Load Mapbox stylesheet dynamically, from CDN */
import './mapbox.scss';
import component from './component.js';
import { settings } from './settings.js';
import FrontendManagement from 'gutenberg/extensions/shared/frontend-management.js';
import apiFetch from '@wordpress/api-fetch';

window.addEventListener( 'load', function() {
	// Do not initialize in editor.
	if ( window.wp.editor ) {
		return;
	}
	const frontendManagement = new FrontendManagement();
	/* Retrieve API key based on service before the block is rendered */
	const beforeRender = data => {
		return new Promise( ( resolve, reject ) => {
			const { map_service } = data;
			const url = '/wp-json/jetpack/v4/service-api-keys/' + map_service;
			apiFetch( { url, method: 'GET' } ).then(
				result => {
					data.api_key = result.service_api_key;
					resolve( data );
				},
				error => {
					reject( error );
				}
			);
		} );
	};
	frontendManagement.blockIterator( document, [
		{
			component,
			options: {
				settings,
				beforeRender,
			},
		},
	] );
} );
