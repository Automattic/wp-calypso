/** @format */
/**
 * External dependencies
 */
import assert from 'assert';
import React from 'react';
import { noop, uniq } from 'lodash';
import { mount, shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import FormToggle from '../';
import CompactFormToggle from '../compact';

describe( 'index', function() {
	describe( 'rendering', function() {
		it( 'should have is-compact class', function() {
			const toggle = shallow( <CompactFormToggle /> );
			assert( toggle.hasClass( 'is-compact' ) );
		} );
	} );
} );

describe( 'FormToggle', function() {
	require( 'test/helpers/use-fake-dom' )();

	describe( 'rendering', function() {
		it( 'should have form-toggle class', function() {
			const toggle = shallow( <FormToggle /> );
			assert( toggle.find( '.form-toggle' ).length === 1 );
		} );

		it( 'should not have is-compact class', function() {
			const toggle = shallow( <FormToggle /> );
			assert( toggle.find( '.is-compact' ).length === 0 );
		} );

		it( 'should be checked when checked is true', function() {
			[ true, false ].forEach( function( bool ) {
				const toggle = shallow( <FormToggle checked={ bool } onChange={ noop } /> );
				const toggleInput = toggle.find( '.form-toggle' );

				assert( 0 < toggleInput.length, 'a form toggle was rendered' );
				assert( bool === toggleInput.props().checked, 'form toggle checked equals boolean' );
			} );
		} );

		it( 'should fire onChange event with value param when clicked', function( done ) {
			const toggle = shallow(
				<FormToggle
					checked={ false }
					onChange={ function( checked ) {
						assert( checked, 'onChange handler was called with a value param' );
						done();
					} }
				/>
			);

			toggle.find( '.form-toggle__switch' ).simulate( 'click' );
		} );

		it( 'should not be disabled when disabled is false', function() {
			const toggle = shallow( <FormToggle checked={ false } disabled={ false } /> );
			const toggleInput = toggle.find( '.form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( false === toggleInput.props().disabled, 'form toggle disabled equals boolean' );
		} );

		it( 'should be disabled when disabled is true', function() {
			const toggle = shallow( <FormToggle checked={ false } disabled={ true } /> );
			const toggleInput = toggle.find( '.form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( true === toggleInput.props().disabled, 'form toggle disabled equals boolean' );
		} );

		it( 'should have a label whose htmlFor matches the checkbox id', function() {
			const toggle = shallow( <FormToggle checked={ false } /> );
			const toggleInput = toggle.find( '.form-toggle__switch' );
			const toggleLabel = toggle.find( 'label' );

			assert( toggleInput.id === toggleLabel.htmlFor );
		} );

		it( 'should create unique ids for each toggle', function() {
			const toggles = mount(
				<div>
					<FormToggle checked={ false } />
					<FormToggle checked={ false } />
					<FormToggle checked={ false } />
				</div>
			);
			const toggleInputs = toggles.find( '.form-toggle' );
			const ids = toggleInputs.map( input => input.props().id );
			return ids.length === uniq( ids ).length;
		} );
	} );
} );
