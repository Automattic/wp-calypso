/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'MapDomain component', () => {
	const pageSpy = spy();
	pageSpy.redirect = spy();
	let MapDomain, MapDomainStep;

	useFakeDom();

	useMockery( ( mockery ) => {
		mockery.registerMock( 'page', pageSpy );
		MapDomain = require( '../' ).MapDomain;
		MapDomainStep = require( 'components/domains/map-domain-step' );
	} );

	beforeEach( () => {
		pageSpy.reset();
		pageSpy.redirect.reset();
	} );

	const defaultProps = {
		productsList: { get: () => {} },
		domainsWithPlansOnly: false,
		translate: () => '',
		selectedSiteIsUpgradeable: true,
	};

	it( 'does not blow up with default props', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } /> );
		expect( wrapper ).to.have.length( 1 );
	} );

	it( 'redirects if site cannot be upgraded at mounting', () => {
		shallow( <MapDomain { ...defaultProps } selectedSiteIsUpgradeable={ false } /> );
		expect( pageSpy.redirect ).to.have.been.calledWith( '/domains/add/mapping' );
	} );

	it( 'redirects if site cannot be upgraded at new props', () => {
		const wrapper = shallow( <MapDomain selectedSiteIsUpgradeable={ true } { ...defaultProps } /> );
		wrapper.setProps( { selectedSiteIsUpgradeable: false } );
		expect( pageSpy.redirect ).to.have.been.calledWith( '/domains/add/mapping' );
	} );

	it( 'redirects if site cannot be upgraded at new props', () => {
		const wrapper = shallow( <MapDomain selectedSiteIsUpgradeable={ true } { ...defaultProps } /> );
		wrapper.setProps( { selectedSiteIsUpgradeable: false } );
		expect( pageSpy.redirect ).to.have.been.calledWith( '/domains/add/mapping' );
	} );

	it( 'renders a MapDomainStep', () => {
		const wrapper = shallow( <MapDomain { ...defaultProps } /> );
		expect( wrapper.find( MapDomainStep ) ).to.have.length( 1 );
	} );
} );
