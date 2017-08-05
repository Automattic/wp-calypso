/** @jest-environment jsdom */
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'page', () => {
	const { spy } = require( 'sinon' );
	const pageSpy = spy();

	pageSpy.redirect = spy();

	return pageSpy;
} );

/**
 * External Dependencies
 */
import { expect } from 'chai';
import pageSpy from 'page';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import { MapDomain } from '..';
import MapDomainStep from 'components/domains/map-domain-step';
import paths from 'my-sites/domains/paths';

describe( 'MapDomain component', () => {
	beforeEach( () => {
		pageSpy.reset();
		pageSpy.redirect.reset();
	} );

	const defaultProps = {
		cart: {},
		productsList: {},
		domainsWithPlansOnly: false,
		translate: string => string,
		isSiteUpgradeable: true,
		selectedSite: {
			ID: 500,
			slug: 'domain.com',
		},
		selectedSiteId: 500,
		selectedSiteSlug: 'domain.com',
	};

	it( 'does not blow up with default props', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } /> );
		expect( wrapper ).to.have.length( 1 );
	} );

	it( 'redirects if site cannot be upgraded at mounting', () => {
		shallow( <MapDomain { ...defaultProps } isSiteUpgradeable={ false } /> );
		expect( pageSpy.redirect ).to.have.been.calledWith( '/domains/add/mapping' );
	} );

	it( 'redirects if site cannot be upgraded at new props', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } isSiteUpgradeable={ true } /> );
		wrapper.setProps( { selectedSiteId: 501, isSiteUpgradeable: false } );
		expect( pageSpy.redirect ).to.have.been.calledWith( '/domains/add/mapping' );
	} );

	it( 'renders a MapDomainStep', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } /> );
		expect( wrapper.find( MapDomainStep ) ).to.have.length( 1 );
	} );

	it( "goes back when HeaderCake's onClick is fired", () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } /> );
		expect( wrapper.find( HeaderCake ).prop( 'onClick' ) ).to.equal( wrapper.instance().goBack );
	} );

	it( 'goes back to /domains/add if no selected site', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } selectedSite={ null } /> );
		wrapper.instance().goBack();
		expect( pageSpy ).to.have.been.calledWith( '/domains/add' );
	} );

	it( 'goes back to domain management for VIP sites', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } selectedSiteSlug="baba"
											selectedSite={ { ...defaultProps.selectedSite, is_vip: true } } /> );
		wrapper.instance().goBack();
		expect( pageSpy ).to.have.been.calledWith( paths.domainManagementList( 'baba' ) );
	} );

	it( 'goes back to domain add page if non-VIP site', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } selectedSiteSlug="baba" /> );
		wrapper.instance().goBack();
		expect( pageSpy ).to.have.been.calledWith( '/domains/add/baba' );
	} );

	it( 'does not render a notice by default', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } /> );
		// we match the notice by props, because enzyme isn't matching the Notice type for some reason
		expect( wrapper.find( { status: 'is-error' } ) ).to.have.length( 0 );
	} );

	it( 'render a notice by when there is an errorMessage in the state ', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } /> );
		// we match the notice by props, because enzyme isn't matching the Notice type for some reason
		wrapper.setState( { errorMessage: 'baba' } );
		expect( wrapper.find( { status: 'is-error' } ) ).to.have.length( 1 );
	} );
} );
