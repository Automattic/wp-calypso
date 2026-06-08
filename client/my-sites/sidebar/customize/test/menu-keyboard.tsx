/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MySitesSidebarUnifiedMenu from '../../menu';
import { CustomizeProvider, useCustomizeContext } from '../index';

function renderInProvider( ui: JSX.Element ) {
	const store = configureStore()( {
		ui: { selectedSiteId: 12345, sidebar: { isCollapsed: false } },
		mySites: { sidebarSections: {} },
		sites: { items: {} },
		adminSidebarLayout: { bySite: {} },
		adminSidebarExpandState: { bySite: {} },
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

describe( '<MySitesSidebarUnifiedMenu> customize keyboard behaviour', () => {
	beforeEach( () => {
		window.scrollTo = jest.fn();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'marks expandable parent rows as reassignable in customize mode', () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<MySitesSidebarUnifiedMenu
					title="Upgrades"
					slug="paid-upgrades-php"
					path="/home/example.wordpress.com"
					link="/plans/example.wordpress.com"
					icon="cart"
					inlineText="Premium"
					itemId="plugin:unknown:-:paid-upgrades.php"
					reassignable
					selected={ false }
					sidebarCollapsed={ false }
					shouldOpenExternalLinksInCurrentTab
					isUnifiedSiteSidebarVisible
				>
					{ [
						{
							title: 'Plans',
							url: '/plans/example.wordpress.com',
							icon: null,
							type: 'submenu-item',
							itemId:
								'plugin:unknown:paid-upgrades.php:https://wordpress.com/plans/example.wordpress.com',
							reassignable: true,
						},
					] }
				</MySitesSidebarUnifiedMenu>
			</CustomizeProvider>
		);

		act( () => {
			screen.getByRole( 'button', { name: 'Enter' } ).click();
		} );

		const row = container.querySelector(
			'li[data-wp-admin-sidebar-item-id="plugin:unknown:-:paid-upgrades.php"]'
		);
		const heading = container.querySelector( 'a.sidebar__heading' ) as HTMLAnchorElement;

		expect( row ).toBeInTheDocument();
		expect( heading ).toHaveAttribute( 'tabindex', '-1' );
		expect( screen.getByRole( 'button', { name: 'Reorder Upgrades' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'More options' } ) ).toHaveTextContent( '⋮' );
		expect( screen.queryByRole( 'button', { name: 'Reorder Plans' } ) ).not.toBeInTheDocument();
	} );

	it( 'does not enable expandable hover flyouts in customize mode', () => {
		jest.useFakeTimers();

		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<MySitesSidebarUnifiedMenu
					title="Jetpack"
					slug="jetpack"
					path="/home/example.wordpress.com"
					link="/wp-admin/admin.php?page=jetpack"
					icon="jetpack"
					itemId="plugin:jetpack/jetpack.php:-:jetpack"
					reassignable
					selected={ false }
					sidebarCollapsed={ false }
					shouldOpenExternalLinksInCurrentTab
					isUnifiedSiteSidebarVisible
				>
					{ [
						{
							title: 'Social',
							url: '/wp-admin/admin.php?page=jetpack-social',
							icon: null,
							type: 'submenu-item',
							itemId: 'plugin:jetpack/jetpack.php:jetpack-social:jetpack-social',
							reassignable: true,
						},
					] }
				</MySitesSidebarUnifiedMenu>
			</CustomizeProvider>
		);

		act( () => {
			screen.getByRole( 'button', { name: 'Enter' } ).click();
		} );

		const menu = container.querySelector( '.sidebar__menu.is-togglable' ) as HTMLElement;

		act( () => {
			fireEvent.mouseOver( menu, { clientX: 120, clientY: 120 } );
			jest.advanceTimersByTime( 220 );
		} );

		expect( menu ).not.toHaveClass( 'hovered' );
	} );
} );
