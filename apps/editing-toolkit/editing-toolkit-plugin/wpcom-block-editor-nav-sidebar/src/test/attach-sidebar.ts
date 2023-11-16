import { __experimentalMainDashboardButton } from '@wordpress/edit-post';

test( '__experimentalMainDashboardButton should be available', () => {
	expect( typeof __experimentalMainDashboardButton ).not.toBe( 'undefined' );
} );
