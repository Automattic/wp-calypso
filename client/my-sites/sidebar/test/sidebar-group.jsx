/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ADMIN_SIDEBAR_GROUP_SET_EXPANDED } from 'calypso/state/action-types';
import { useCustomizeContext } from '../customize';
import { MySitesSidebarUnifiedSidebarGroup } from '../sidebar-group';

jest.mock( '../customize', () => ( {
	useCustomizeContext: jest.fn(),
} ) );

const mockUseCustomizeContext = useCustomizeContext;

const renderInProvider = ( ui, state = {} ) => {
	const store = configureStore()( {
		ui: { selectedSiteId: 12345 },
		adminSidebarExpandState: { bySite: {} },
		...state,
	} );
	const result = render( <Provider store={ store }>{ ui }</Provider> );
	return { ...result, store };
};

const pluginsGroup = {
	id: 'plugins',
	label: 'My Plugins',
	// `default_expanded: false` mirrors the schema contract.
	default_expanded: false,
	signal: { attention: true, count: 3 },
};

const addonsGroup = {
	id: 'addons',
	label: 'Add-ons',
	default_expanded: false,
	signal: { attention: false, count: 0 },
};

describe( '<MySitesSidebarUnifiedSidebarGroup>', () => {
	beforeEach( () => {
		mockUseCustomizeContext.mockReturnValue( null );
	} );

	it( 'renders the group label', () => {
		renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		expect( screen.getByText( 'My Plugins' ) ).toBeInTheDocument();
	} );

	it( 'renders the toggle button with aria-expanded reflecting the resolved state', () => {
		const { rerender, store } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup } expanded={ false }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		expect( screen.getByRole( 'button', { name: /My Plugins/i } ) ).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		rerender(
			<Provider store={ store }>
				<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup } expanded>
					<li>child</li>
				</MySitesSidebarUnifiedSidebarGroup>
			</Provider>
		);
		expect( screen.getByRole( 'button', { name: /My Plugins/i } ) ).toHaveAttribute(
			'aria-expanded',
			'true'
		);
	} );

	it( 'shows the attention dot when collapsed and any child has attention', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup } expanded={ false }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		const signal = container.querySelector( '.wp-admin-sidebar-group__signal' );
		expect( signal ).toHaveAttribute( 'data-attention', 'true' );
	} );

	it( 'suppresses the attention dot when expanded (children carry their own signals)', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup } expanded>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		const signal = container.querySelector( '.wp-admin-sidebar-group__signal' );
		expect( signal ).not.toHaveAttribute( 'data-attention' );
	} );

	it( 'omits the customize button on non-plugins groups by default', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ addonsGroup } expanded={ false }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		expect(
			container.querySelector( '.wp-admin-sidebar-group__customize' )
		).not.toBeInTheDocument();
	} );

	it( 'renders the customize button on the plugins group with the correct tooltip metadata', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup } expanded={ false }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		const customize = container.querySelector( '.wp-admin-sidebar-group__customize' );
		expect( customize ).toBeInTheDocument();
		expect( customize ).toHaveAttribute( 'aria-label', 'Edit plugin order' );
		expect( customize ).toHaveAttribute( 'data-tooltip', 'Edit plugin order' );
		// Phase 1 keeps it disabled until Phase 2 wires the click handler.
		expect( customize ).toBeDisabled();
	} );

	it( 'renders the chevron OUTSIDE the toggle (avoids invalid nested <button>)', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup } expanded={ false }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		const toggle = container.querySelector( '.wp-admin-sidebar-group__toggle' );
		const chevron = container.querySelector( '.wp-admin-sidebar-group__chevron' );
		expect( toggle ).toBeInTheDocument();
		expect( chevron ).toBeInTheDocument();
		// Chevron is a sibling of the toggle, not a descendant.
		expect( toggle?.contains( chevron ) ).toBe( false );
		expect( chevron ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'sets inert / aria-hidden on the children container when collapsed', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup } expanded={ false }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		const children = container.querySelector( '.wp-admin-sidebar-group__children' );
		expect( children ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'invokes onToggle prop and dispatches a window resize on toggle click', () => {
		const onToggle = jest.fn();
		// Force requestAnimationFrame to be synchronous in this test so the
		// scheduled resize dispatch fires inline. The component intentionally
		// schedules via rAF to let React flush; without the override the
		// resize event would land on the next browser frame.
		const rafSpy = jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( cb ) => {
			cb( 0 );
			return 0;
		} );
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup
				group={ pluginsGroup }
				expanded={ false }
				onToggle={ onToggle }
			>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		fireEvent.click( screen.getByRole( 'button', { name: /My Plugins/i } ) );
		expect( onToggle ).toHaveBeenCalledTimes( 1 );
		const dispatchedResize = dispatchSpy.mock.calls.some(
			( [ event ] ) => event?.type === 'resize'
		);
		expect( dispatchedResize ).toBe( true );
		rafSpy.mockRestore();
		dispatchSpy.mockRestore();
	} );

	it( 'falls back to default_expanded when no stored or prop value is provided', () => {
		// addonsGroup.default_expanded === false → resolved expanded is false.
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ addonsGroup }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		expect( container.querySelector( '.wp-admin-sidebar-group' ) ).toHaveAttribute(
			'data-expanded',
			'false'
		);
	} );

	it( 'defaults the plugins group to expanded on first encounter', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);
		expect( container.querySelector( '.wp-admin-sidebar-group' ) ).toHaveAttribute(
			'data-expanded',
			'true'
		);
	} );

	it( 'stores collapsed when toggling the default-expanded plugins group', () => {
		const { store } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>
		);

		fireEvent.click( screen.getByRole( 'button', { name: /My Plugins/i } ) );

		expect( store.getActions() ).toContainEqual( {
			type: ADMIN_SIDEBAR_GROUP_SET_EXPANDED,
			siteId: 12345,
			groupId: 'plugins',
			expanded: false,
		} );
	} );

	it( 'honors stored collapsed state for the plugins group', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>,
			{
				adminSidebarExpandState: {
					bySite: { 12345: { plugins: false } },
				},
			}
		);
		expect( container.querySelector( '.wp-admin-sidebar-group' ) ).toHaveAttribute(
			'data-expanded',
			'false'
		);
	} );

	it( 'locks the plugins group expanded during customize mode', () => {
		mockUseCustomizeContext.mockReturnValue( {
			isCustomizing: true,
			enter: jest.fn(),
		} );
		const { container, store } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ pluginsGroup }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>,
			{
				adminSidebarExpandState: {
					bySite: { 12345: { plugins: false } },
				},
			}
		);
		const group = container.querySelector( '.wp-admin-sidebar-group' );
		const toggle = container.querySelector( '.wp-admin-sidebar-group__toggle' );
		const chevron = container.querySelector( '.wp-admin-sidebar-group__chevron' );

		expect( group ).toHaveClass( 'wp-admin-sidebar-group--reorder-locked' );
		expect( group ).toHaveAttribute( 'data-expanded', 'true' );
		expect( toggle ).toBeDisabled();

		fireEvent.click( chevron );

		expect( store.getActions() ).toEqual( [] );
		expect( group ).toHaveAttribute( 'data-expanded', 'true' );
	} );

	it( 'reads stored expand state from Redux when no prop is supplied', () => {
		const { container } = renderInProvider(
			<MySitesSidebarUnifiedSidebarGroup group={ addonsGroup }>
				<li>child</li>
			</MySitesSidebarUnifiedSidebarGroup>,
			{
				adminSidebarExpandState: {
					bySite: { 12345: { addons: true } },
				},
			}
		);
		expect( container.querySelector( '.wp-admin-sidebar-group' ) ).toHaveAttribute(
			'data-expanded',
			'true'
		);
	} );
} );
