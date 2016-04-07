/**
 * External dependencies
 */
import { expect } from 'chai';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

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
	let form, fooInput, barInput, reactContainer;

	useFakeDom.withContainer();

	before( () => {
		reactContainer = useFakeDom.getContainer();
	} );

	beforeEach( function() {
		form = ReactDom.render( <DirtyLinkedForm />, reactContainer );
		fooInput = ReactDom.findDOMNode( form ).querySelector( '.foo' );
		barInput = ReactDom.findDOMNode( form ).querySelector( '.bar' );
	} );

	afterEach( function() {
		ReactDom.unmountComponentAtNode( reactContainer );
	} );

	it( 'initially has default state', function( ) {
		expect( form.state ).to.deep.equal( { foo: 'default foo', bar: 'default bar' } );
	} );

	it( 'adds a modified field to dirtyFields', function() {
		TestUtils.Simulate.change( fooInput, { target: { value: 'new value' } } );
		expect( form.state ).to.deep.equal( {
			foo: 'new value',
			bar: 'default bar',
			dirtyFields: [ 'foo' ]
		} );
	} );

	it( 'when a field is modified multiple times, the dirty field is only added once', function() {
		TestUtils.Simulate.change( fooInput, { target: { value: 'new value' } } );
		TestUtils.Simulate.change( fooInput, { target: { value: 'updated value' } } );
		expect( form.state ).to.deep.equal( {
			foo: 'updated value',
			bar: 'default bar',
			dirtyFields: [ 'foo' ]
		} );
	} );

	it( 'can have multiple dirty fields', function() {
		TestUtils.Simulate.change( fooInput, { target: { value: 'new value' } } );
		TestUtils.Simulate.change( fooInput, { target: { value: 'updated value' } } );
		TestUtils.Simulate.change( barInput, { target: { value: 'so many bars' } } );
		expect( form.state ).to.deep.equal( {
			foo: 'updated value',
			bar: 'so many bars',
			dirtyFields: [ 'foo', 'bar' ]
		} );
	} );
} );
