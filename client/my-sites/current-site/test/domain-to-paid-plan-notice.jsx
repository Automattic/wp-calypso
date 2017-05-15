/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'DomainToPaidPlanNotice', function() {
	const translate = stub();
	const site = { ID: 12345, slug: 'site_slug' };
	const abtests = [];
	let DomainToPaidPlanNotice;

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', { abtest: ( test ) => abtests[ test ] } );
	} );

	before( () => {
		DomainToPaidPlanNotice = require( '../domain-to-paid-plan-notice' ).DomainToPaidPlanNotice;
	} );

	beforeEach( () => {
		abtests.domainToPaidPlanUpsellNudge = 'show';
		translate.returns( 'translated content' );
	} );

	it( 'should render null when there is no site', function() {
		const wrapper = shallow( <DomainToPaidPlanNotice /> );

		expect( wrapper.type() ).to.equal( null );
	} );

	it( 'should render null when ineligible', function() {
		const wrapper = shallow( <DomainToPaidPlanNotice site={ site } /> );

		expect( wrapper.type() ).to.equal( null );
	} );

	it( 'should render null when a/b test variant is skip', function() {
		abtests.domainToPaidPlanUpsellNudge = 'skip';
		const wrapper = shallow( <DomainToPaidPlanNotice site={ site } eligible /> );

		expect( wrapper.type() ).to.equal( null );
	} );

	it( 'should render component when a/b test variant is show', function() {
		const wrapper = shallow( <DomainToPaidPlanNotice site={ site } eligible /> );
		expect( wrapper.type().displayName ).to.equal( 'Localized(Notice)' );
	} );
} );
