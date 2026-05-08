/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
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

	it( 'renders Save / Cancel after entering customize mode', async () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<CustomizeFooter />
			</CustomizeProvider>
		);
		// Click enter to flip the orchestrator into customize mode.
		( container.querySelector( 'button' ) as HTMLButtonElement ).click();
		// React 18 batches state — wait for the re-render. Footer renders
		// synchronously once isCustomizing flips, but the test environment
		// needs a microtask flush.
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		expect( screen.getByRole( 'button', { name: /Save/i } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Cancel/i } ) ).toBeInTheDocument();
	} );

	it( 'disables Save until the working delta is dirty', async () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<CustomizeFooter />
			</CustomizeProvider>
		);
		( container.querySelector( 'button' ) as HTMLButtonElement ).click();
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		const save = screen.getByRole( 'button', { name: /Save/i } );
		expect( save ).toBeDisabled();
	} );
} );
