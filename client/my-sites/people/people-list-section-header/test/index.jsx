/**
 * External dependencies
 */

import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PeopleListSectionHeader', function() {
	let configMock;
	let PeopleListSectionHeader;
	let SectionHeader;

	useFakeDom();

	useMockery( mockery => {
		configMock = stub();
		configMock.isEnabled = stub();
		mockery.registerMock( 'config', configMock );
	} );

	before( function() {
		SectionHeader = require( 'components/section-header' );
		PeopleListSectionHeader = require( '..' ).PeopleSectionHeader;
	} );

	it( 'renders SectionHeader', function() {
		const wrapper = shallow(
			<PeopleListSectionHeader
				label="label value"
			/>
		);

		expect( wrapper.find( SectionHeader ).length ).to.equal( 1 );
		expect( wrapper.find( SectionHeader ).props().label ).to.equal( 'label value' );
	} );
} );
