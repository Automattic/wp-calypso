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

describe( 'Team', function() {
	let Card,
		PeopleListItem,
		Team,
		configMock;

	useFakeDom();
	useMockery( mockery => {
		configMock = sinon.stub();
		configMock.isEnabled = sinon.stub();
		mockery.registerMock( 'config', configMock );
		mockery.registerMock( 'lib/analytics', {} );
		mockery.registerMock( 'lib/sites-list', () => null );
	} );

	before( function() {
		Card = require( 'components/card' );
		PeopleListItem = require( 'my-sites/people/people-list-item' );

		Team = require( '../team' ).Team;
	} );

	it( 'renders loading placeholder before fetch has started', function() {
		const wrapper = shallow(
			<Team
				fetchInitialized={ true }
				fetchingUsers={ false }
				fetchOptions={ {} }
				users={ [] }
				excludedUsers={ [] }
			/>
		);

		expect( wrapper.find( Card ).find( PeopleListItem ).key() ).to.equal( 'people-list-item-placeholder' );
	} );
} );
