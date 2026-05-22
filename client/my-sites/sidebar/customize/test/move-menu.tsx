/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { CustomizeProvider, useCustomizeContext } from '../index';
import { MoveMenu } from '../move-menu';

function renderInProvider( ui: JSX.Element, state: object = {} ) {
	const store = configureStore()( {
		ui: { selectedSiteId: 12345 },
		adminSidebarLayout: { bySite: {} },
		adminSidebarExpandState: { bySite: {} },
		...state,
	} );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

let exposedCtx: ReturnType< typeof useCustomizeContext > | null = null;
function ExposeContext() {
	exposedCtx = useCustomizeContext();
	return null;
}

function setupSidebar( itemLocation: 'top_level' | 'plugins' ) {
	document.body.innerHTML = `
		<ul class="sidebar">
			${
				itemLocation === 'top_level'
					? '<li class="sidebar__menu-item-parent" data-wp-admin-sidebar-item-id="stats"><a class="sidebar__menu-link">Stats</a></li>'
					: ''
			}
			<li class="wp-admin-sidebar-group sidebar-group" data-group="plugins" data-expanded="true">
				<div class="wp-admin-sidebar-group__header sidebar-group__header">
					<button type="button" class="wp-admin-sidebar-group__toggle sidebar-group__toggle">
						<span class="wp-admin-sidebar-group__label sidebar-group__label">My Plugins</span>
					</button>
				</div>
				<ul class="wp-admin-sidebar-group__children sidebar-group__children">
					${
						itemLocation === 'plugins'
							? '<li class="sidebar__menu-item-parent" data-wp-admin-sidebar-item-id="stats"><a class="sidebar__menu-link">Stats</a></li>'
							: ''
					}
				</ul>
			</li>
		</ul>
		<button id="trigger" type="button">More options</button>
	`;
	return document.getElementById( 'trigger' ) as HTMLButtonElement;
}

describe( '<MoveMenu>', () => {
	beforeEach( () => {
		exposedCtx = null;
	} );

	it( 'offers group destinations for top-level items and commits the selected group move', () => {
		const trigger = setupSidebar( 'top_level' );

		renderInProvider(
			<CustomizeProvider>
				<ExposeContext />
				<MoveMenu itemId="stats" itemLabel="Stats" triggerEl={ trigger } onClose={ jest.fn() } />
			</CustomizeProvider>
		);

		expect( screen.getByRole( 'menuitem', { name: 'Move to My Plugins' } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'menuitem', { name: 'Move to top level' } )
		).not.toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'menuitem', { name: 'Move to My Plugins' } ) );

		expect( exposedCtx?.draft.workingDelta.overrides ).toEqual( [
			{
				itemId: 'stats',
				position: { kind: 'in_group', group_id: 'plugins', index: 0 },
			},
		] );
	} );

	it( 'offers a top-level destination for grouped items', () => {
		const trigger = setupSidebar( 'plugins' );

		renderInProvider(
			<CustomizeProvider>
				<ExposeContext />
				<MoveMenu itemId="stats" itemLabel="Stats" triggerEl={ trigger } onClose={ jest.fn() } />
			</CustomizeProvider>
		);

		expect(
			screen.queryByRole( 'menuitem', { name: 'Move to My Plugins' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Move to top level' } ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'menuitem', { name: 'Move to top level' } ) );

		expect( exposedCtx?.draft.workingDelta.overrides ).toEqual( [
			{
				itemId: 'stats',
				position: { kind: 'top_level', index: 0 },
			},
		] );
	} );
} );
