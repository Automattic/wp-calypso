/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { SitesDropdown } from '..';

jest.mock( 'lib/user', () => () => {} );

describe( 'index', () => {
	describe( 'component rendering', () => {
		test( 'should render a dropdown component initially closed', () => {
			const sitesDropdown = shallow( <SitesDropdown /> );
			expect( sitesDropdown.hasClass( 'sites-dropdown' ) ).to.be.true;
			expect( sitesDropdown.hasClass( 'is-open' ) ).to.be.false;
		} );

		test( 'should toggle the dropdown, when it is clicked', () => {
			const toggleOpenSpy = sinon.spy( SitesDropdown.prototype, 'toggleOpen' );
			const sitesDropdown = shallow( <SitesDropdown /> );

			sitesDropdown.find( '.sites-dropdown__selected' ).simulate( 'click' );

			sinon.assert.calledOnce( toggleOpenSpy );
			expect( sitesDropdown.hasClass( 'is-open' ) ).to.be.true;

			toggleOpenSpy.restore();
		} );
	} );

	describe( 'component state', () => {
		test( 'should initially consider as selected the selectedOrPrimarySiteId prop', () => {
			const sitesDropdown = shallow( <SitesDropdown selectedSiteId={ 1234567 } /> );
			expect( sitesDropdown.instance().state.selectedSiteId ).to.be.equal( 1234567 );
		} );
	} );

	describe( 'selectSite', () => {
		test( 'should update the `selectedSiteSlug`, and `open` state properties', () => {
			const setStateSpy = sinon.spy();
			const siteSelectedSpy = sinon.spy();
			const fakeContext = {
				setState: setStateSpy,
				props: {
					onSiteSelect: siteSelectedSpy,
				},
			};

			SitesDropdown.prototype.selectSite.call( fakeContext, 12345 );

			sinon.assert.calledOnce( siteSelectedSpy );
			sinon.assert.calledWith( siteSelectedSpy, 12345 );

			sinon.assert.calledOnce( setStateSpy );
			sinon.assert.calledWith( setStateSpy, { open: false, selectedSiteId: 12345 } );
		} );
	} );

	describe( 'onClose', () => {
		test( 'should set `open` state property to false', () => {
			const setStateSpy = sinon.spy();
			const fakeContext = {
				setState: setStateSpy,
				props: {
					onClose: noop,
				},
			};

			SitesDropdown.prototype.onClose.call( fakeContext );

			sinon.assert.calledOnce( setStateSpy );
			sinon.assert.calledWith( setStateSpy, { open: false } );
		} );

		test( 'should run the component `onClose` hook, when it is provided', () => {
			const onCloseSpy = sinon.spy();
			const fakeContext = {
				setState: noop,
				props: {
					onClose: onCloseSpy,
				},
			};

			SitesDropdown.prototype.onClose.call( fakeContext );
			sinon.assert.calledOnce( onCloseSpy );
		} );
	} );

	describe( 'getSelectedSite', () => {
		xit( 'should return a site on the basis of the component `selectedSiteSlug` state property', function() {
			const fakeState = {
				selectedSiteId: 42,
			};
			const selectedSite = SitesDropdown.prototype.getSelectedSite.call( { state: fakeState } );
			expect( selectedSite ).to.be.eql( {
				ID: 42,
				slug: 'foo.wordpress.com',
			} );
		} );
	} );
} );
