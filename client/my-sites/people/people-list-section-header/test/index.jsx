/**
 * External dependencies
 */

import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PeopleListSectionHeader', function() {
	let configMock,
		ReactInjection,
		translations,
		translate,
		PeopleListSectionHeader,
		SectionHeader;

	useFakeDom();

	useMockery( mockery => {
		configMock = sinon.stub();
		configMock.isEnabled = sinon.stub();
		mockery.registerMock( 'config', configMock );
		mockery.registerMock( 'lib/analytics', {} );
	} );

	before( function() {
		ReactInjection = require( 'react/lib/ReactInjection' );
		translations = [];
		translate = function() {
			translations.push( Array.from( arguments ) );
		};
		ReactInjection.Class.injectMixin( { translate: translate } );

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
