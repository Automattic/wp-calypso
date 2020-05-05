/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert';
import { mount, shallow } from 'enzyme';
import { noop, uniq } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import FormToggle from '../';
import CompactFormToggle from '../compact';

describe( 'index', () => {
	describe( 'rendering', () => {
		test( 'should have is-compact class', () => {
			const toggle = shallow( <CompactFormToggle /> );
			assert( toggle.hasClass( 'is-compact' ) );
		} );
	} );
} );

describe( 'FormToggle', () => {
	describe( 'rendering', () => {
		test( 'should have form-toggle class', () => {
			const toggle = shallow( <FormToggle /> );
			assert( toggle.find( '.form-toggle' ).length === 1 );
		} );

		test( 'should not have is-compact class', () => {
			const toggle = shallow( <FormToggle /> );
			assert( toggle.find( '.is-compact' ).length === 0 );
		} );

		test( 'should be checked when checked is true', () => {
			[ true, false ].forEach( function ( bool ) {
				const toggle = shallow( <FormToggle checked={ bool } onChange={ noop } /> );
				const toggleInput = toggle.find( '.form-toggle' );

				assert( 0 < toggleInput.length, 'a form toggle was rendered' );
				assert( bool === toggleInput.props().checked, 'form toggle checked equals boolean' );
			} );
		} );

		test( 'should fire onChange event with value param when clicked', ( done ) => {
			const toggle = shallow(
				<FormToggle
					checked={ false }
					onChange={ function ( checked ) {
						assert( checked, 'onChange handler was called with a value param' );
						done();
					} }
				/>
			);

			toggle.find( '.form-toggle__switch' ).simulate( 'click' );
		} );

		test( 'should not be disabled when disabled is false', () => {
			const toggle = shallow( <FormToggle checked={ false } disabled={ false } /> );
			const toggleInput = toggle.find( '.form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( false === toggleInput.props().disabled, 'form toggle disabled equals boolean' );
		} );

		test( 'should be disabled when disabled is true', () => {
			const toggle = shallow( <FormToggle checked={ false } disabled={ true } /> );
			const toggleInput = toggle.find( '.form-toggle' );

			assert( 0 < toggleInput.length, 'a form toggle was rendered' );
			assert( true === toggleInput.props().disabled, 'form toggle disabled equals boolean' );
		} );

		test( 'should have a label whose htmlFor matches the checkbox id', () => {
			const toggle = shallow( <FormToggle checked={ false } /> );
			const toggleInput = toggle.find( '.form-toggle__switch' );
			const toggleLabel = toggle.find( 'label' );

			assert( toggleInput.id === toggleLabel.htmlFor );
		} );

		test( 'should create unique ids for each toggle', () => {
			const toggles = mount(
				<div>
					<FormToggle checked={ false } />
					<FormToggle checked={ false } />
					<FormToggle checked={ false } />
				</div>
			);
			const toggleInputs = toggles.find( '.form-toggle' );
			const ids = toggleInputs.map( ( input ) => input.props().id );

			assert( ids.length === uniq( ids ).length );
		} );
	} );
} );
