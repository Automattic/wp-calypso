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

describe( 'PeopleListItem', function() {
	let configMock,
		ReactInjection,
		translations,
		translate,
		PeopleListItem,
		CompactCard;

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

		CompactCard = require( 'components/card/compact' );
		PeopleListItem = require( '..' );
	} );

	it( 'renders CompactCard', function() {
		const wrapper = shallow(
			<PeopleListItem
			/>
		);

		expect( wrapper.find( CompactCard ).length ).to.equal( 1 );
		expect( wrapper.find( CompactCard ).props().className ).to.equal( 'people-list-item' );
	} );
} );
