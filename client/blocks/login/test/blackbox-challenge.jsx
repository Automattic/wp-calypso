/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
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
		<BlackboxChallenge enabled onSubmitBlockedChange={ onSubmitBlockedChange } />
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
	} );

	test( 'does not space the container before the widget has rendered', () => {
		expect( renderChallenge( { isChallengeActive: true } ) ).not.toHaveClass(
			'has-visible-challenge'
		);
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
