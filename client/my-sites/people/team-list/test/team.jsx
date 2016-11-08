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
		ReactInjection,
		Team,
		translations,
		translate,
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
		ReactInjection = require( 'react/lib/ReactInjection' );
		translations = [];
		translate = function() {
			translations.push( Array.from( arguments ) );
		};
		ReactInjection.Class.injectMixin( { translate: translate } );

		Card = require( 'components/card' );
		PeopleListItem = require( 'my-sites/people/people-list-item' );
		PeopleListSectionHeader = require( 'my-sites/people/people-list-section-header' );

		Team = require( '../team' );
	} );

	it( 'render heading with showRoles if manage/people/role-filtering toggle is enabled', function() {
		configMock.isEnabled
				.withArgs( 'manage/people/role-filtering' )
				.returns( true );

		const wrapper = shallow(
			<Team
				fetchOptions={ {} }
				users={ [] }
				excludedUsers={ [] }
			/>
		);

		expect( wrapper.find( PeopleListSectionHeader ).prop( 'showRoles' ) ).to.be.true;
	} );

	it( 'render heading without showRoles if manage/people/role-filtering toggle is disbled', function() {
		configMock.isEnabled
				.withArgs( 'manage/people/role-filtering' )
				.returns( false );

		const wrapper = shallow(
			<Team
				fetchOptions={ {} }
				users={ [] }
				excludedUsers={ [] }
			/>
		);

		expect( wrapper.find( PeopleListSectionHeader ).prop( 'showRoles' ) ).to.be.false;
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

		expect( wrapper.find( Card ).find( PeopleListItem).key() ).to.equal( 'people-list-item-placeholder' );
	} );
} );
