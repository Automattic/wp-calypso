/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import BulkSelect from '../index';

describe( 'index', () => {
	test( 'should have BulkSelect class', () => {
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ noop } />
		);
		assert.equal( 1, bulkSelect.find( '.bulk-select' ).length );
	} );

	test( 'should not be checked when initialized without selectedElements', () => {
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ noop } />
		);
		assert.equal( 0, bulkSelect.find( '.is-checked' ).length );
	} );

	test( 'should be checked when initialized with all elements selected', () => {
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 3 } totalElements={ 3 } onToggle={ noop } />
		);
		assert.equal( 1, bulkSelect.find( '.is-checked' ).length );
	} );

	test( 'should not be checked when initialized with some elements selected', () => {
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 2 } totalElements={ 3 } onToggle={ noop } />
		);
		assert.equal( 0, bulkSelect.find( '.is-checked' ).length );
	} );

	test( 'should render line gridicon when initialized with some elements selected', () => {
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 2 } totalElements={ 3 } onToggle={ noop } />
		);
		assert.equal( 1, bulkSelect.find( '.bulk-select__some-checked-icon' ).length );
	} );

	test( 'should be call onToggle when clicked', () => {
		let hasBeenCalled = false;
		const callback = function() {
			hasBeenCalled = true;
		};
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ callback } />
		);
		bulkSelect.simulate( 'click' );
		assert.equal( hasBeenCalled, true );
	} );

	test( 'should be call onToggle with the new state when there are no selected elements', done => {
		const callback = function( newState ) {
			assert.equal( newState, true );
			done();
		};
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ callback } />
		);
		bulkSelect.simulate( 'click' );
	} );

	test( 'should be call onToggle with the new state when there are some selected elements', done => {
		const callback = function( newState ) {
			assert.equal( newState, false );
			done();
		};
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 1 } totalElements={ 3 } onToggle={ callback } />
		);
		bulkSelect.simulate( 'click' );
	} );

	test( 'should be call onToggle with the new state when there all elements are selected', done => {
		const callback = function( newState ) {
			assert.equal( newState, false );
			done();
		};
		const bulkSelect = shallow(
			<BulkSelect selectedElements={ 3 } totalElements={ 3 } onToggle={ callback } />
		);
		bulkSelect.simulate( 'click' );
	} );
} );
