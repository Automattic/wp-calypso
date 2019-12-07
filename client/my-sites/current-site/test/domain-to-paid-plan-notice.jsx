/** @format */

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

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

import { DomainToPaidPlanNotice } from '../domain-to-paid-plan-notice';

describe( 'DomainToPaidPlanNotice', () => {
	const translate = stub();
	const site = { ID: 12345, slug: 'site_slug' };

	beforeEach( () => {
		translate.returns( 'translated content' );
	} );

	test( 'should render null when there is no site', () => {
		const wrapper = shallow( <DomainToPaidPlanNotice /> );

		expect( wrapper.type() ).to.equal( null );
	} );

	test( 'should render null when ineligible', () => {
		const wrapper = shallow( <DomainToPaidPlanNotice site={ site } /> );

		expect( wrapper.type() ).to.equal( null );
	} );

	test( 'should render component when site information is available and the site is eligible', () => {
		const wrapper = shallow( <DomainToPaidPlanNotice site={ site } eligible /> );
		expect( wrapper.type().displayName ).to.equal( 'Connect(Localized(SidebarBanner))' );
	} );
} );
