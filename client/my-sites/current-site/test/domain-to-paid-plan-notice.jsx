/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import { DomainToPaidPlanNotice } from '../domain-to-paid-plan-notice';

describe( 'DomainToPaidPlanNotice', function() {
	const translate = stub();
	const site = { ID: 12345, slug: 'site_slug' };

	beforeEach( () => {
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

	it( 'should render component when site information is available and the site is eligible', function() {
		const wrapper = shallow( <DomainToPaidPlanNotice site={ site } eligible /> );
		expect( wrapper.type().displayName ).to.equal( 'Localized(Notice)' );
	} );
} );
