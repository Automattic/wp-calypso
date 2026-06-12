/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MySitesSidebarUnifiedItem from '../../item';
import { CustomizeProvider, useCustomizeContext } from '../index';

function renderInProvider( ui: JSX.Element ) {
	const store = configureStore()( {
		ui: { selectedSiteId: 12345, sidebar: { isCollapsed: false } },
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

describe( '<MySitesSidebarUnifiedItem> customize keyboard behaviour', () => {
	beforeEach( () => {
		window.scrollTo = jest.fn();
	} );

	it( 'removes the row link from tab order and suppresses navigation in customize mode', () => {
		const trackClickEvent = jest.fn();
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<MySitesSidebarUnifiedItem
					title="Stats"
					slug="stats"
					url="https://example.com/stats"
					icon="stats"
					inlineIcon={ null }
					itemId="stats"
					reassignable
					trackClickEvent={ trackClickEvent }
					shouldOpenExternalLinksInCurrentTab
				/>
			</CustomizeProvider>
		);

		act( () => {
			screen.getByRole( 'button', { name: 'Enter' } ).click();
		} );

		const link = container.querySelector( 'a.sidebar__menu-link' ) as HTMLAnchorElement;
		expect( link ).toHaveAttribute( 'tabindex', '-1' );
		expect( screen.getByRole( 'button', { name: 'Reorder Stats' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'More options' } ) ).toHaveTextContent( '⋮' );

		fireEvent.click( link );

		expect( trackClickEvent ).not.toHaveBeenCalled();
		expect( window.scrollTo ).not.toHaveBeenCalled();
	} );

	it( 'hides the more-options trigger from focus after click-close', () => {
		const { container } = renderInProvider(
			<CustomizeProvider>
				<EnterButton />
				<MySitesSidebarUnifiedItem
					title="Stats"
					slug="stats"
					url="https://example.com/stats"
					icon="stats"
					inlineIcon={ null }
					itemId="stats"
					reassignable
					shouldOpenExternalLinksInCurrentTab
				/>
			</CustomizeProvider>
		);

		act( () => {
			screen.getByRole( 'button', { name: 'Enter' } ).click();
		} );

		const trigger = screen.getByRole( 'button', { name: 'More options' } );
		trigger.focus();
		fireEvent.click( trigger );
		expect( trigger ).toHaveAttribute( 'aria-expanded', 'true' );

		fireEvent.click( trigger );

		expect( trigger ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( container.ownerDocument.activeElement ).not.toBe( trigger );
	} );
} );
