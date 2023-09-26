/**
 * @jest-environment jsdom
 */
import userEvent from '@testing-library/user-event';
import preferences from 'calypso/state/preferences/reducer';
import ui from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SitesDropdown } from '..';

const noop = () => {};

const render = ( el, options ) =>
	renderWithProvider( el, {
		...options,
		reducers: { ui, preferences },
		initialState: { preferences: { remoteValues: {} } },
	} );

describe( 'index', () => {
	describe( 'component rendering', () => {
		const props = {
			selectedSiteId: 12345678,
			primarySiteId: 12345678,
		};
		test( 'should render a dropdown component initially closed', () => {
			const { container } = render( <SitesDropdown { ...props } /> );

			expect( container.firstChild ).toHaveClass( 'sites-dropdown' );
			expect( container.firstChild ).not.toHaveClass( 'is-open' );
		} );

		test( 'with multiple sites, should toggle the dropdown when it is clicked', async () => {
			const user = userEvent.setup();
			const toggleOpenSpy = jest.spyOn( SitesDropdown.prototype, 'toggleOpen' );

			const { container } = render( <SitesDropdown { ...props } hasMultipleSites /> );

			await user.click( container.querySelector( '.sites-dropdown__selected' ) );

			expect( toggleOpenSpy ).toHaveBeenCalledTimes( 1 );

			expect( container.firstChild ).toHaveClass( 'has-multiple-sites' );
			expect( container.firstChild ).toHaveClass( 'is-open' );

			toggleOpenSpy.mockRestore();
		} );

		test( 'with only one site, nothing should happen when it is clicked', async () => {
			const user = userEvent.setup();
			const toggleOpenSpy = jest.spyOn( SitesDropdown.prototype, 'toggleOpen' );

			const { container } = render( <SitesDropdown { ...props } hasMultipleSites={ false } /> );

			await user.click( container.querySelector( '.sites-dropdown__selected' ) );

			expect( toggleOpenSpy ).toHaveBeenCalledTimes( 1 );

			expect( container.firstChild ).not.toHaveClass( 'has-multiple-sites' );
			expect( container.firstChild ).not.toHaveClass( 'is-open' );

			toggleOpenSpy.mockRestore();
		} );
	} );

	describe( 'selectSite', () => {
		test( 'should update the `selectedSiteSlug`, and `open` state properties', () => {
			const setStateSpy = jest.fn();
			const siteSelectedSpy = jest.fn();
			const fakeContext = {
				setState: setStateSpy,
				props: {
					onSiteSelect: siteSelectedSpy,
				},
			};

			SitesDropdown.prototype.selectSite.call( fakeContext, 12345 );

			expect( siteSelectedSpy ).toHaveBeenCalledTimes( 1 );
			expect( siteSelectedSpy ).toHaveBeenCalledWith( 12345 );

			expect( setStateSpy ).toHaveBeenCalledTimes( 1 );
			expect( setStateSpy ).toHaveBeenCalledWith( { open: false, selectedSiteId: 12345 } );
		} );
	} );

	describe( 'onClose', () => {
		test( 'should set `open` state property to false', () => {
			const setStateSpy = jest.fn();
			const fakeContext = {
				setState: setStateSpy,
				props: {
					onClose: noop,
				},
			};

			SitesDropdown.prototype.onClose.call( fakeContext );

			expect( setStateSpy ).toHaveBeenCalledTimes( 1 );
			expect( setStateSpy ).toHaveBeenCalledWith( { open: false } );
		} );

		test( 'should run the component `onClose` hook, when it is provided', () => {
			const onCloseSpy = jest.fn();
			const fakeContext = {
				setState: noop,
				props: {
					onClose: onCloseSpy,
				},
			};

			SitesDropdown.prototype.onClose.call( fakeContext );
			expect( onCloseSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
