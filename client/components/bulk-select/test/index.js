/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import noop from 'lodash/noop';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import BulkSelect from '../index';

describe.only( 'index', () => {
	useFakeDom();

	it( 'should have BulkSelect class', () => {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ noop } /> );
		assert.isDefined( bulkSelect.find( '.bulk-select' ).node );
	} );

	it( 'should not be checked when initialized without selectedElements', () => {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ noop } /> );
		assert.isUndefined( bulkSelect.find( { checked: true } ).node );
	} );

	it( 'should be checked when initialized with all elements selected', () => {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 3 } totalElements={ 3 } onToggle={ noop } /> );
		assert.isDefined( bulkSelect.find( { checked: true } ).node );
	} );

	it( 'should not be checked when initialized with some elements selected', () => {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 2 } totalElements={ 3 } onToggle={ noop } /> );
		assert.isUndefined( bulkSelect.find( { checked: true } ).node );
	} );

	it( 'should render line gridicon when initialized with some elements selected', () => {
		const bulkSelect = shallow( <BulkSelect selectedElements={ 2 } totalElements={ 3 } onToggle={ noop } /> );
		assert.isDefined( bulkSelect.find( '.bulk-select__some-checked-icon' ).node );
	} );

	it( 'should call onToggle when clicked', () => {
		const callback = sinon.spy();
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
		assert.isTrue( callback.called );
	} );

	it( 'should call onToggle with the new state when there are no selected elements', done => {
		const callback = newState => {
			assert.isFalse( newState );
			done();
		};
		const bulkSelect = shallow( <BulkSelect selectedElements={ 0 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
	} );

	it( 'should call onToggle with the new state when there are some selected elements', done => {
		const callback = newState => {
			assert.isTrue( newState );
			done();
		};
		const bulkSelect = shallow( <BulkSelect selectedElements={ 1 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
	} );

	it( 'should call onToggle with the new state when there all elements are selected', done => {
		const callback = newState => {
			assert.isTrue( newState );
			done();
		};
		const bulkSelect = shallow( <BulkSelect selectedElements={ 3 } totalElements={ 3 } onToggle={ callback } /> );
		bulkSelect.simulate( 'click' );
	} );
} );
