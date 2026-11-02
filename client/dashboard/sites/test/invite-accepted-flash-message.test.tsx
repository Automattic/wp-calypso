/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { render } from '../../test-utils';
import { InviteAcceptedFlashMessage } from '../invite-accepted-flash-message';

afterEach( () => {
	dispatch( noticesStore ).removeAllNotices( 'snackbar' );
} );

test( 'shows the accepted invite, then removes its params', async () => {
	window.history.replaceState(
		null,
		'',
		'/sites?flash=invite-accepted&invite-role=editor&invite-site-title=My%20Blog&page=2'
	);
	render( <InviteAcceptedFlashMessage /> );

	await waitFor( () => expect( window.location.search ).toBe( '?page=2' ) );
	expect(
		select( noticesStore )
			.getNotices()
			.map( ( { content } ) => content )
	).toEqual( [ 'You’re now an Editor of My Blog.' ] );
} );
