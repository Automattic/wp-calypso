/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import preferencesReducer from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DismissibleCard from '../index';

function renderCard( props ) {
	return renderWithProvider(
		<DismissibleCard preferenceName="card-test" { ...props }>
			Card body
		</DismissibleCard>,
		{
			reducers: { preferences: preferencesReducer },
			initialState: { preferences: { remoteValues: {} } },
		}
	);
}

describe( 'DismissibleCard', () => {
	test( 'calls onCardClick when the card body is clicked', async () => {
		const user = userEvent.setup();
		const onCardClick = vi.fn();
		renderCard( { onCardClick } );

		await user.click( screen.getByText( 'Card body' ) );

		expect( onCardClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does not call onCardClick when the dismiss button is clicked', async () => {
		const user = userEvent.setup();
		const onCardClick = vi.fn();
		const onClick = vi.fn();
		renderCard( { onCardClick, onClick } );

		await user.click( screen.getByLabelText( 'Dismiss' ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
		expect( onCardClick ).not.toHaveBeenCalled();
	} );

	test( 'lets a dismiss click reach document-level listeners', async () => {
		const user = userEvent.setup();
		const documentListener = vi.fn();
		document.addEventListener( 'click', documentListener );
		renderCard( { onCardClick: vi.fn() } );

		await user.click( screen.getByLabelText( 'Dismiss' ) );

		document.removeEventListener( 'click', documentListener );
		expect( documentListener ).toHaveBeenCalledTimes( 1 );
	} );
} );
