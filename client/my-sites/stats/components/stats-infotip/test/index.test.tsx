/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import StatsInfotip from '..';

describe( 'StatsInfotip', () => {
	it( 'keeps trigger clicks from activating clickable parents', () => {
		const onParentClick = jest.fn();

		render(
			<div role="button" tabIndex={ 0 } onClick={ onParentClick } onKeyDown={ jest.fn() }>
				<StatsInfotip label="More information">Tooltip content</StatsInfotip>
			</div>
		);

		const clickEvent = new MouseEvent( 'click', {
			bubbles: true,
			cancelable: true,
		} );

		fireEvent( screen.getByRole( 'button', { name: 'More information' } ), clickEvent );

		expect( clickEvent.defaultPrevented ).toBe( true );
		expect( onParentClick ).not.toHaveBeenCalled();
	} );
} );
