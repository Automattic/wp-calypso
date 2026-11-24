/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import { useBlackbox } from 'calypso/blocks/login/utils/use-blackbox';
import BlackboxChallenge from '../blackbox-challenge';

jest.mock( 'calypso/blocks/login/utils/use-blackbox', () => ( {
	useBlackbox: jest.fn(),
} ) );

function renderChallenge( state, onSubmitBlockedChange = jest.fn() ) {
	useBlackbox.mockReturnValue( {
		isChallengeActive: false,
		isLoading: false,
		hasChallengeContent: false,
		...state,
	} );

	const { container } = render(
		<BlackboxChallenge
			enabled
			apiKey="signup-key"
			onSubmitBlockedChange={ onSubmitBlockedChange }
		/>
	);

	return container.querySelector( '.login__form-blackbox-challenge' );
}

describe( 'BlackboxChallenge', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'spaces the container while the widget occupies space', () => {
		expect( renderChallenge( { hasChallengeContent: true } ) ).toHaveClass(
			'has-visible-challenge'
		);
		expect( useBlackbox ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: true, apiKey: 'signup-key' } )
		);
	} );

	test( 'does not space the container before the widget has rendered', () => {
		expect( renderChallenge( { isChallengeActive: true } ) ).not.toHaveClass(
			'has-visible-challenge'
		);
	} );

	describe( 'loading message', () => {
		const loadingMessage = () => screen.queryByText( 'Loading the security check…' );

		afterEach( () => {
			jest.useRealTimers();
		} );

		test( 'shows in a live region while a raised challenge has nothing to show yet', () => {
			renderChallenge( { isChallengeActive: true } );

			expect( loadingMessage() ).toBeVisible();
			expect( screen.getByRole( 'status' ) ).toContainElement( loadingMessage() );
		} );

		test( 'goes away once the widget has rendered, leaving the live region mounted', () => {
			renderChallenge( { isChallengeActive: true, hasChallengeContent: true } );

			expect( loadingMessage() ).not.toBeInTheDocument();
			expect( screen.getByRole( 'status' ) ).toBeEmptyDOMElement();
		} );

		test( 'waits a moment before showing for the first load', () => {
			jest.useFakeTimers();
			renderChallenge( { isLoading: true } );

			expect( loadingMessage() ).not.toBeInTheDocument();

			act( () => jest.advanceTimersByTime( 1000 ) );

			expect( loadingMessage() ).toBeVisible();
		} );

		test( 'stays away when nothing is loading', () => {
			renderChallenge( {} );

			expect( loadingMessage() ).not.toBeInTheDocument();
		} );
	} );

	test( 'unblocks submit once the challenge completes, even though the widget stays mounted', () => {
		const onSubmitBlockedChange = jest.fn();

		renderChallenge( { hasChallengeContent: true }, onSubmitBlockedChange );

		expect( onSubmitBlockedChange ).toHaveBeenLastCalledWith( false );
	} );

	test( 'blocks submit while a challenge is active', () => {
		const onSubmitBlockedChange = jest.fn();

		renderChallenge( { isChallengeActive: true }, onSubmitBlockedChange );

		expect( onSubmitBlockedChange ).toHaveBeenLastCalledWith( true );
	} );
} );
