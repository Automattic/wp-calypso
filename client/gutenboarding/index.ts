/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { hideMasterbar, main, redirectIfNotEnabled } from './controller';
import { makeLayout, render as clientRender } from 'controller';

// Don't complain about window.wp.data types in our debug function
declare const window: any;

export default function() {
	page(
		'/gutenboarding',
		redirectIfNotEnabled,
		( context, next ) => {
			if ( process.env.NODE_ENV !== 'production' ) {
				if ( typeof window === 'object' ) {
					if ( ! window.wp ) {
						window.wp = {};
					}
					if ( ! window.wp.data ) {
						window.wp.data = require( '@wordpress/data' );
					}
				}
			}
			next();
		},
		hideMasterbar,
		main,
		makeLayout,
		clientRender
	);
}
