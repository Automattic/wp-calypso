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
	const abtests = [];
	const abtest = ( test ) => abtests[ test ];
	let DomainToPaidPlanNotice;

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', abtest );
	} );

	before( () => {
		DomainToPaidPlanNotice = require( '../domain-to-paid-plan-notice' ).DomainToPaidPlanNotice;
	} );

	beforeEach( () => {
		abtests.domainToPaidPlanUpsellNudge = 'show';
		translate.returns( 'translated content' );
	} );

	it( 'should render null when ineligible', function() {
		const wrapper = shallow( <DomainToPaidPlanNotice eligible={ false } /> );

		expect( wrapper.type() ).to.equal( null );
	} );

	it( 'should render null when a/b test variant is skip', function() {
		abtests.domainToPaidPlanUpsellNudge = 'skip';
		const wrapper = shallow( <DomainToPaidPlanNotice eligible /> );

		expect( wrapper.type() ).to.equal( null );
	} );

	it( 'should default to noop for translation', function() {
		const wrapper = shallow( <DomainToPaidPlanNotice eligible /> );

		expect( wrapper.find( 'p' ).props().children ).to.equal( undefined );
	} );

	it( 'should render translated content', function() {
		const wrapper = shallow( <DomainToPaidPlanNotice eligible translate={ translate }></DomainToPaidPlanNotice> );

		expect( wrapper.find( 'p' ).props().children ).to.equal( 'translated content' );
		expect( translate ).to.have.been.calledWith( 'content' );
	} );
} );
