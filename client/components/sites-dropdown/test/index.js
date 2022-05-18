/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import { SitesDropdown } from '..';

const noop = () => {};

describe( 'index', () => {
	describe( 'component rendering', () => {
		test( 'should render a dropdown component initially closed', () => {
			const sitesDropdown = shallow( <SitesDropdown /> );
			expect( sitesDropdown.hasClass( 'sites-dropdown' ) ).toEqual( true );
			expect( sitesDropdown.hasClass( 'is-open' ) ).toEqual( false );
		} );

		test( 'with multiple sites, should toggle the dropdown when it is clicked', () => {
			const toggleOpenSpy = jest.spyOn( SitesDropdown.prototype, 'toggleOpen' );
			const sitesDropdown = shallow( <SitesDropdown hasMultipleSites={ true } /> );

			sitesDropdown.find( '.sites-dropdown__selected' ).simulate( 'click' );
			expect( toggleOpenSpy ).toBeCalledTimes( 1 );
			expect( sitesDropdown.hasClass( 'has-multiple-sites' ) ).toEqual( true );
			expect( sitesDropdown.hasClass( 'is-open' ) ).toEqual( true );

			toggleOpenSpy.mockRestore();
		} );

		test( 'with only one site, nothing should happen when it is clicked', () => {
			const toggleOpenSpy = jest.spyOn( SitesDropdown.prototype, 'toggleOpen' );
			const sitesDropdown = shallow( <SitesDropdown hasMultipleSites={ false } /> );

			sitesDropdown.find( '.sites-dropdown__selected' ).simulate( 'click' );
			expect( toggleOpenSpy ).toBeCalledTimes( 1 );
			expect( sitesDropdown.hasClass( 'has-multiple-sites' ) ).toEqual( false );
			expect( sitesDropdown.hasClass( 'is-open' ) ).toEqual( false );

			toggleOpenSpy.mockRestore();
		} );
	} );

	describe( 'component state', () => {
		test( 'should initially consider as selected the selectedOrPrimarySiteId prop', () => {
			const sitesDropdown = shallow( <SitesDropdown selectedSiteId={ 1234567 } /> );
			expect( sitesDropdown.instance().state.selectedSiteId ).toEqual( 1234567 );
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

			expect( siteSelectedSpy ).toBeCalledTimes( 1 );
			expect( siteSelectedSpy ).toHaveBeenCalledWith( 12345 );

			expect( setStateSpy ).toBeCalledTimes( 1 );
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

			expect( setStateSpy ).toBeCalledTimes( 1 );
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
			expect( onCloseSpy ).toBeCalledTimes( 1 );
		} );
	} );
} );
