/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import FollowButton from '../button';

describe( 'FollowButton', () => {
	test( 'should apply a custom follow label', () => {
		render(
			<Provider store={ createTestStore( true ) }>
				<FollowButton followLabel="Follow Tag" />
			</Provider>
		);

		expect( screen.getByText( 'Follow Tag' ) ).toBeVisible();
	} );

	test( 'should be empty', () => {
		render(
			<Provider store={ createTestStore( false ) }>
				<FollowButton followLabel="Follow Tag" />
			</Provider>
		);

		expect( screen.getByText( 'Follow Tag' ) ).toBeEmptyDOMElement();
	} );
} );

function createTestStore( verified ) {
	return createReduxStore( {
		currentUser: {
			user: {
				email_verified: verified,
			},
		},
	} );
}
