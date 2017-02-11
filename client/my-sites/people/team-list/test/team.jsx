/**
 * External dependencies
 */

import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { stub, spy } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'Team', function() {
	let Card;
	let PeopleListSectionHeader;
	let InfiniteList;
	let Team;
	let configMock;
	let deterministicStringify;

	useFakeDom();
	useMockery( mockery => {
		configMock = stub();
		configMock.isEnabled = stub();
		mockery.registerMock( 'config', configMock );

		deterministicStringify = stub();
		mockery.registerMock( 'lib/deterministic-stringify', deterministicStringify );
		mockery.registerMock( 'lib/sites-list', () => null );
	} );

	before( function() {
		Card = require( 'components/card' );
		PeopleListSectionHeader = require( 'my-sites/people/people-list-section-header' ).default;
		InfiniteList = require( 'components/infinite-list' );

		Team = require( '../team' ).Team;
	} );

	it( 'renders infinite list when site is specified and any users have been loaded', function() {
		deterministicStringify
			.withArgs( { option1: 'option1value', option2: 'option2value' } )
			.returns( 'list key' );

		const wrapper = shallow(
			<Team
				fetchInitialized={ true }
				fetchingUsers={ false }
				fetchOptions={ { option1: 'option1value', option2: 'option2value', number: 10, offset: 2 } }
				site={ 'site1' }
				users={ [ 'user1' ] }
				excludedUsers={ [] }
			/>
		);

		expect( wrapper.find( Card ).find( InfiniteList ).key() ).to.equal( 'list key' );
	} );

	it( 'renders translated team header text when there are no results', function() {
		const translate = spy( () => 'translation' );

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

		expect( translate ).to.have.been.calledWith( 'Team' );

		expect( wrapper.find( PeopleListSectionHeader ).prop( 'label' ) ).to.equal( 'translation' );
	} );

	it( 'renders translated header text for search when there are search results', function() {
		const translate = spy( () => 'translation' );

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

		expect( translate ).to.have.been.calledWith(
			'%(numberPeople)d Person Matching {{em}}"%(searchTerm)s"{{/em}}',
			'%(numberPeople)d People Matching {{em}}"%(searchTerm)s"{{/em}}',
		);

		expect( wrapper.find( PeopleListSectionHeader ).prop( 'label' ) ).to.equal( 'translation' );
	} );
} );
