/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { CustomizeFooter } from '../footer';
import { CustomizeProvider, useCustomizeContext } from '../index';
import type { JSX } from 'react';

function renderInProvider( ui: JSX.Element, state: object = {} ) {
	const store = configureStore()( {
		ui: { selectedSiteId: 12345 },
		adminSidebarLayout: { bySite: {} },
		adminSidebarExpandState: { bySite: {} },
		...state,
	} );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

function EnterButton() {
	const ctx = useCustomizeContext();
	return (
		<button type="button" onClick={ () => ctx?.enter() }>
			Enter
		</button>
	);
}

describe( '<CustomizeFooter>', () => {
	it( 'renders nothing when customize mode is off', () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<CustomizeFooter />
			</CustomizeProvider>
		);
		expect( container.querySelector( '.admin-sidebar-customize-footer' ) ).toBeNull();
	} );

	it( 'renders auto-save controls after entering customize mode', () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<CustomizeFooter />
			</CustomizeProvider>
		);
		// Click enter to flip the orchestrator into customize mode. Wrap in
		// act() so React state updates settle before assertions.
		act( () => {
			( container.querySelector( 'button' ) as HTMLButtonElement ).click();
		} );
		expect( screen.getByText( 'Changes save automatically.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Undo/i } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Done/i } ) ).toBeInTheDocument();
	} );

	it( 'disables Undo until there is a completed move', () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<CustomizeFooter />
			</CustomizeProvider>
		);
		act( () => {
			( container.querySelector( 'button' ) as HTMLButtonElement ).click();
		} );
		const undo = screen.getByRole( 'button', { name: /Undo/i } );
		expect( undo ).toBeDisabled();
	} );
} );
