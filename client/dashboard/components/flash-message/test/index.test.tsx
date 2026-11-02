/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { render } from '../../../test-utils';
import FlashMessage from '../index';

afterEach( () => {
	dispatch( noticesStore ).removeAllNotices( 'snackbar' );
} );

test( 'shows the snackbar whose id matches the flash param, then removes the param', async () => {
	window.history.replaceState( null, '', '/me/security?flash=password&tab=email' );
	render(
		<>
			<FlashMessage id="username" message="Username saved." />
			<FlashMessage id="password" message="Password not saved." type="error" />
		</>
	);

	await waitFor( () => expect( window.location.search ).toBe( '?tab=email' ) );
	expect( window.location.pathname ).toBe( '/me/security' );
	expect(
		select( noticesStore )
			.getNotices()
			.map( ( { content, status } ) => [ content, status ] )
	).toEqual( [ [ 'Password not saved.', 'error' ] ] );
} );
