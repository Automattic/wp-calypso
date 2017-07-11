/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import BulkSelect from '../index';

describe( 'index', function() {
	it( 'should have BulkSelect class', function() {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ noop } /> );
		assert.equal( 1, bulkSelect.find( '.bulk-select' ).length );
	} );

	it( 'should not be checked when initialized without selectedElements', function() {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ noop } /> );
		assert.equal( 0, bulkSelect.find( '.is-checked' ).length );
	} );

	it( 'should be checked when initialized with all elements selected', function() {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 3 } totalElements={ 3 } onToggle={ noop } /> );
		assert.equal( 1, bulkSelect.find( '.is-checked' ).length );
	} );

	it( 'should not be checked when initialized with some elements selected', function() {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 2 } totalElements={ 3 } onToggle={ noop } /> );
		assert.equal( 0, bulkSelect.find( '.is-checked' ).length );
	} );

	it( 'should render line gridicon when initialized with some elements selected', function() {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 2 } totalElements={ 3 } onToggle={ noop } /> );
		assert.equal( 1, bulkSelect.find( '.bulk-select__some-checked-icon' ).length );
	} );

	it( 'should be call onToggle when clicked', function() {
		let hasBeenCalled = false;
		const callback = function() {
			hasBeenCalled = true;
		};
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
		assert.equal( hasBeenCalled, true );
	} );

	it( 'should be call onToggle with the new state when there are no selected elements', function( done ) {
		const callback = function( newState ) {
			assert.equal( newState, true );
			done();
		};
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
	} );

	it( 'should be call onToggle with the new state when there are some selected elements', function( done ) {
		const callback = function( newState ) {
			assert.equal( newState, false );
			done();
		};
		const bulkSelect = shallow( <BulkSelect selectedElements={ 1 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
	} );

	it( 'should be call onToggle with the new state when there all elements are selected', function( done ) {
		const callback = function( newState ) {
			assert.equal( newState, false );
			done();
		};
		const bulkSelect = shallow( <BulkSelect selectedElements={ 3 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
	} );
} );
