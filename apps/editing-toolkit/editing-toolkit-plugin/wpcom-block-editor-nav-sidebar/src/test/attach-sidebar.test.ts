/**
 * External dependencies
 */
import { __experimentalMainDashboardButton } from '@wordpress/interface';

test( '__experimentalMainDashboardButton should be available', () => {
	expect( typeof __experimentalMainDashboardButton ).not.toBe( 'undefined' );
} );
