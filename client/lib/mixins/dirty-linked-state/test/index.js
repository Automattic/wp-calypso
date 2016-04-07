/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import dirtyLinkedState from 'lib/mixins/dirty-linked-state';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Dirty Linked State Mixin', function() {
	const DirtyLinkedForm = React.createClass( {
		mixins: [ dirtyLinkedState ],
		getInitialState() {
			return {
				foo: 'default foo',
				bar: 'default bar'
			};
		},
		render() {
			return (
				<form>
					<input type="text" className="foo" valueLink={ this.linkState( 'foo' ) } />
					<input type="text" className="bar" valueLink={ this.linkState( 'bar' ) } />
				</form>
			);
		}
	} );
	let form, fooInput, barInput;

	useFakeDom();

	beforeEach( function() {
		form = mount( <DirtyLinkedForm /> );
		fooInput = form.find( '.foo' );
		barInput = form.find( '.bar' );
	} );

	it( 'initially has default state', function( ) {
		expect( form.state() ).to.deep.equal( { foo: 'default foo', bar: 'default bar' } );
	} );

	it( 'adds a modified field to dirtyFields', function() {
		fooInput.simulate( 'change', { target: { value: 'new value' } } );
		expect( form.state() ).to.deep.equal( {
			foo: 'new value',
			bar: 'default bar',
			dirtyFields: [ 'foo' ]
		} );
	} );

	it( 'when a field is modified multiple times, the dirty field is only added once', function() {
		fooInput.simulate( 'change', { target: { value: 'new value' } } );
		fooInput.simulate( 'change', { target: { value: 'updated value' } } );
		expect( form.state() ).to.deep.equal( {
			foo: 'updated value',
			bar: 'default bar',
			dirtyFields: [ 'foo' ]
		} );
	} );

	it( 'can have multiple dirty fields', function() {
		fooInput.simulate( 'change', { target: { value: 'new value' } } );
		fooInput.simulate( 'change', { target: { value: 'updated value' } } );
		barInput.simulate( 'change', { target: { value: 'so many bars' } } );
		expect( form.state() ).to.deep.equal( {
			foo: 'updated value',
			bar: 'so many bars',
			dirtyFields: [ 'foo', 'bar' ]
		} );
	} );
} );
