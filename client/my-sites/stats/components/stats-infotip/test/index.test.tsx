/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsInfotip from '..';

describe( 'StatsInfotip', () => {
	it( 'keeps trigger clicks from activating clickable parents', () => {
		const onParentClick = jest.fn();

		render(
			<div role="button" tabIndex={ 0 } onClick={ onParentClick } onKeyDown={ jest.fn() }>
				<StatsInfotip label="More information">Tooltip content</StatsInfotip>
			</div>
		);

		// userEvent doesn't expose defaultPrevented on the click it dispatches, so this
		// asserts directly on a constructed MouseEvent instead.
		const clickEvent = new MouseEvent( 'click', {
			bubbles: true,
			cancelable: true,
		} );

		fireEvent( screen.getByRole( 'button', { name: 'More information' } ), clickEvent );

		expect( clickEvent.defaultPrevented ).toBe( true );
		expect( onParentClick ).not.toHaveBeenCalled();
	} );

	it( 'opens the popup on trigger click, exposing the label and content', async () => {
		const user = userEvent.setup();

		render( <StatsInfotip label="More information">Tooltip content</StatsInfotip> );

		await user.click( screen.getByRole( 'button', { name: 'More information' } ) );

		const popup = await screen.findByRole( 'dialog', { name: 'More information' } );

		expect( popup ).toBeVisible();
		expect( screen.getByText( 'Tooltip content' ) ).toBeVisible();
	} );
} );
