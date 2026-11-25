/**
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { useBlackbox } from 'calypso/blocks/login/utils/use-blackbox';
import BlackboxChallenge from '../blackbox-challenge';

vi.mock( 'calypso/blocks/login/utils/use-blackbox', () => ( {
	useBlackbox: vi.fn(),
} ) );

function renderChallenge( state, onSubmitBlockedChange = vi.fn() ) {
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
		vi.clearAllMocks();
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

	test( 'unblocks submit once the challenge completes, even though the widget stays mounted', () => {
		const onSubmitBlockedChange = vi.fn();

		renderChallenge( { hasChallengeContent: true }, onSubmitBlockedChange );

		expect( onSubmitBlockedChange ).toHaveBeenLastCalledWith( false );
	} );

	test( 'blocks submit while a challenge is active', () => {
		const onSubmitBlockedChange = vi.fn();

		renderChallenge( { isChallengeActive: true }, onSubmitBlockedChange );

		expect( onSubmitBlockedChange ).toHaveBeenLastCalledWith( true );
	} );
} );
