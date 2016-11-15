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
		PeopleListSectionHeader,
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
		PeopleListItem = require( 'my-sites/people/people-list-item' ).default;
		PeopleListSectionHeader = require( 'my-sites/people/people-list-section-header' ).default;

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

	it( 'renders translated team header text by default', function() {
		const translate = sinon.stub();
		translate
			.withArgs( 'Team', { context: 'A navigation label.' } )
			.returns( 'team label' );

		const wrapper = shallow(
			<Team
				fetchInitialized={ true }
				fetchingUsers={ false }
				fetchOptions={ {} }
				users={ [] }
				excludedUsers={ [] }
				translate={ translate }
			/>
		);

		expect( translate.callCount )
		.to.equal( 1 );

		expect( wrapper.find( PeopleListSectionHeader ).prop( 'label' ) )
		.to.equal( 'team label' );
	} );

	it( 'renders translated header text for search when there are search results', function() {
		const translate = sinon.stub();
		translate
			.returns( 'translated search label' );
		translate
			.withArgs( 'Team', { context: 'A navigation label.' } )
			.returns( 'team label' );

		const wrapper = shallow(
			<Team
				fetchInitialized={ true }
				fetchingUsers={ false }
				fetchOptions={ {} }
				search={ 'abc' }
				site={ 'site1' }
				totalUsers={ 1 }
				users={ [ 'user1' ] }
				excludedUsers={ [] }
				translate={ translate }
			/>
		);

		expect( translate.callCount )
		.to.equal( 2 );

		expect( wrapper.find( PeopleListSectionHeader ).prop( 'label' ) )
		.to.equal( 'translated search label' );
	} );
} );
