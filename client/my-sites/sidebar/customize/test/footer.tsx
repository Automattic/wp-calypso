/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { CustomizeFooter } from '../footer';
import { CustomizeProvider, useCustomizeContext } from '../index';
import type { LayoutDelta } from 'calypso/state/admin-sidebar/layout/types';

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

const savedDelta: LayoutDelta = {
	version: 1,
	updated_at: 100,
	overrides: [
		{
			itemId: 'plugin:stats:-:stats.php',
			position: { kind: 'top_level', index: 2 },
		},
	],
};

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
		expect( screen.queryByText( 'Changes save automatically.' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Reset all/i } ) ).toBeDisabled();
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

	it( 'confirms reset all and folds saving state into Done', async () => {
		const saveLayoutImpl = jest.fn( () => new Promise< LayoutDelta >( () => {} ) );
		const { container } = renderInProvider(
			<CustomizeProvider saveLayoutImpl={ saveLayoutImpl }>
				<EnterButton />
				<CustomizeFooter />
			</CustomizeProvider>,
			{
				adminSidebarLayout: { bySite: { 12345: savedDelta } },
			}
		);
		act( () => {
			( container.querySelector( 'button' ) as HTMLButtonElement ).click();
		} );

		const resetButton = screen.getByRole( 'button', { name: /Reset all/i } );
		expect( resetButton ).toBeEnabled();

		fireEvent.click( resetButton );
		const dialog = screen.getByRole( 'dialog', { name: 'Reset all to default?' } );
		expect(
			within( dialog ).getByText(
				'This restores the default order and grouping for every item in the sidebar. Your current customizations will be removed.'
			)
		).toBeInTheDocument();

		fireEvent.click( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) );
		expect(
			screen.queryByRole( 'dialog', { name: 'Reset all to default?' } )
		).not.toBeInTheDocument();

		fireEvent.click( resetButton );
		const confirmDialog = screen.getByRole( 'dialog', { name: 'Reset all to default?' } );
		fireEvent.click( within( confirmDialog ).getByRole( 'button', { name: 'Reset all' } ) );

		await waitFor( () => expect( saveLayoutImpl ).toHaveBeenCalledTimes( 1 ) );
		const savedDeltaArg = (
			saveLayoutImpl.mock.calls[ 0 ] as unknown as [ unknown, { delta: LayoutDelta } ]
		 )[ 1 ].delta;
		expect( savedDeltaArg.overrides ).toEqual( [] );
		expect( screen.getByRole( 'button', { name: 'Saving…' } ) ).toBeDisabled();
		expect( screen.queryByText( 'Saving…' ) ).not.toHaveClass(
			'admin-sidebar-customize-footer__status'
		);
	} );
} );
