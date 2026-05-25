/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { CustomizeFooter } from '../footer';
import { CustomizeProvider, useCustomizeContext } from '../index';

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

	it( 'renders Save / Cancel after entering customize mode', () => {
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
		expect( screen.getByRole( 'button', { name: /Save/i } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Cancel/i } ) ).toBeInTheDocument();
	} );

	it( 'disables Save until the working delta is dirty', () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<CustomizeFooter />
			</CustomizeProvider>
		);
		act( () => {
			( container.querySelector( 'button' ) as HTMLButtonElement ).click();
		} );
		const save = screen.getByRole( 'button', { name: /Save/i } );
		expect( save ).toBeDisabled();
	} );
} );
