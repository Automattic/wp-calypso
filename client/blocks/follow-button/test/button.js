/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import FollowButton from '../button';

describe( 'FollowButton', () => {
	test( 'should apply a custom follow label', () => {
		const initialState = createReduxStore( {
			currentUser: {
				email_verified: true,
			},
		} );
		render(
			<Provider store={ initialState }>
				<FollowButton followLabel="Follow Tag" />
			</Provider>
		);

		expect( screen.getByText( 'Follow Tag' ) ).toBeVisible();
	} );

	test( 'should NOT apply a custom follow label', () => {
		const initialState = createReduxStore( {
			currentUser: {
				email_verified: false,
			},
		} );
		render(
			<Provider store={ initialState }>
				<FollowButton followLabel="Follow Tag" />
			</Provider>
		);

		expect( screen.getByText( 'Follow Tag' ) ).toBeFalsy();
	} );
} );
