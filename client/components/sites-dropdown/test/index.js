/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';

describe( 'index', function() {
	useFakeDom();

	useFilesystemMocks( __dirname );

	useMockery( mockery => {
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
	} );

	describe( 'mapStateToProps', function() {
		let mapStateToProps;

		before( function() {
			mapStateToProps = require( '../index.jsx' ).mapStateToProps;
		} );

		it( 'should map component "selectedSiteId" ownProp to "primarySite" prop', function() {
			const state = {
				sites: {
					items: {
						1: {
							ID: 1,
							URL: 'http://primary.wordpress.com'
						},
						42: {
							ID: 42,
							URL: 'http://foo.wordpress.com'
						}
					}
				}
			};

			const ownProps = {
				selectedSiteId: 42
			};

			const { primarySite } = mapStateToProps( state, ownProps );

			expect( primarySite.slug ).to.be.equal( 'foo.wordpress.com' );
		} );
	} );

	describe( 'SitesDropdown', function() {
		let SitesDropdown;

		before( function() {
			SitesDropdown = require( '../index.jsx' ).SitesDropdown;
		} );

		describe( 'component rendering', function() {
			it( 'should render a dropdown component initially closed', function() {
				const sitesDropdown = shallow( <SitesDropdown /> );
				expect( sitesDropdown.hasClass( 'sites-dropdown' ) ).to.be.true;
				expect( sitesDropdown.hasClass( 'is-open' ) ).to.be.false;
			} );

			it( 'should toggle the dropdown, when it is clicked', function() {
				const toggleDropdownSpy = sinon.spy( SitesDropdown.prototype, 'toggleDropdown' );
				const sitesDropdown = shallow( <SitesDropdown /> );

				sitesDropdown.find( '.sites-dropdown__selected' ).simulate( 'click' );

				sinon.assert.calledOnce( toggleDropdownSpy );
				expect( sitesDropdown.hasClass( 'is-open' ) ).to.be.true;

				toggleDropdownSpy.restore();
			} );
		} );

		describe( 'component state', function() {
			it( "should initially consider as selected the user's primary site, when is not specified something different", function() {
				const sitesDropdown = shallow( <SitesDropdown /> );
				expect( sitesDropdown.instance().state.selectedSiteSlug ).to.be.equal( 'primary.wordpress.com' );
			} );

			it( 'should initially consider as selected the site that is passed as `primarySite` prop', function() {
				const primarySite = {
					slug: 'foo.wordpress.com'
				};
				const sitesDropdown = shallow( <SitesDropdown primarySite={ primarySite } /> );
				expect( sitesDropdown.instance().state.selectedSiteSlug ).to.be.equal( 'foo.wordpress.com' );
			} );
		} );

		describe( 'selectSite', function() {
			it( 'should update the `selectedSiteSlug`, and `open` state properties', function() {
				const setStateSpy = sinon.spy();
				const siteSelectedSpy = sinon.spy();
				const fakeContext = {
					setState: setStateSpy,
					props: {
						onSiteSelect: siteSelectedSpy
					}
				};

				SitesDropdown.prototype.selectSite.call( fakeContext, 'foobar' );

				sinon.assert.calledOnce( siteSelectedSpy );
				sinon.assert.calledWith( siteSelectedSpy, 'foobar' );

				sinon.assert.calledOnce( setStateSpy );
				sinon.assert.calledWith( setStateSpy, { open: false, selectedSiteSlug: 'foobar' } );
			} );
		} );

		describe( 'onClose', function() {
			it( 'should set `open` state property to false', function() {
				const setStateSpy = sinon.spy();
				const fakeContext = {
					setState: setStateSpy,
					props: {
						onClose: noop
					}
				};

				SitesDropdown.prototype.onClose.call( fakeContext );

				sinon.assert.calledOnce( setStateSpy );
				sinon.assert.calledWith( setStateSpy, { open: false } );
			} );

			it( 'should run the component `onClose` hook, when it is provided', function() {
				const onCloseSpy = sinon.spy();
				const fakeContext = {
					setState: noop,
					props: {
						onClose: onCloseSpy
					}
				};

				SitesDropdown.prototype.onClose.call( fakeContext );
				sinon.assert.calledOnce( onCloseSpy );
			} );
		} );
	} );
} );
