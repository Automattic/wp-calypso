/**
 * @jest-environment jsdom
 */
import { screen, render } from '@testing-library/react';
import MigrateNotice from 'calypso/blocks/login/migrate-notice';

describe( 'MigrateNotice', () => {
	test( 'displays a migrate notice with a link to wordpress.com/move/', () => {
		render( <MigrateNotice /> );

		expect(
			screen.getByRole( 'link', { name: 'Get help moving your site to WordPress.com' } )
		).toHaveAttribute( 'href', 'https://wordpress.com/move/' );
	} );
} );
