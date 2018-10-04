/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Sparkline from '../index';

describe( 'Sparkline', () => {
	const shallowWithoutLifecycle = arg => shallow( arg, { disableLifecycleMethods: true } );

	test( 'should allow data to be set.', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		assert.deepEqual( [ 1, 2, 3, 4, 5 ], sparkline.props.data );
	} );

	test( 'should have sparkline class', () => {
		const sparkline = shallowWithoutLifecycle( <Sparkline data={ [ 1, 2, 3, 4, 5 ] } /> );
		assert.lengthOf( sparkline.find( '.sparkline' ), 1 );
	} );

	test( 'should have className if provided, as well as sparkline class', () => {
		const sparkline = shallowWithoutLifecycle(
			<Sparkline data={ [ 1, 2, 3, 4, 5 ] } className="test__foobar" />
		);
		assert.lengthOf( sparkline.find( '.test__foobar' ), 1 );
		assert.lengthOf( sparkline.find( '.sparkline' ), 1 );
	} );

	test( 'should have a default aspectRatio of 4.5', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		assert.equal( '4.5', sparkline.props.aspectRatio );
	} );

	test( 'should have a defined aspectRatio if set', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } aspectRatio={ 10 } />;
		assert.equal( '10', sparkline.props.aspectRatio );
	} );

	test( 'should have a default highlightRadius of 3.5', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		assert.equal( '3.5', sparkline.props.highlightRadius );
	} );

	test( 'should have a defined highlightRadius if set', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } highlightRadius={ 10 } />;
		assert.equal( '10', sparkline.props.highlightRadius );
	} );

	test( 'should have a default margin', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } />;
		assert.deepEqual( { top: 4, right: 4, bottom: 4, left: 4 }, sparkline.props.margin );
	} );

	test( 'should have a defined margin if set', () => {
		const sparkline = (
			<Sparkline data={ [ 1, 2, 3, 4, 5 ] } margin={ { top: 1, right: 1, bottom: 1, left: 1 } } />
		);
		assert.deepEqual( { top: 1, right: 1, bottom: 1, left: 1 }, sparkline.props.margin );
	} );

	test( 'should allow maxHeight to be defined.', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } maxHeight={ 10 } />;
		assert.equal( '10', sparkline.props.maxHeight );
	} );

	test( 'should allow highlightIndex to be defined.', () => {
		const sparkline = <Sparkline data={ [ 1, 2, 3, 4, 5 ] } highlightIndex={ 10 } />;
		assert.equal( '10', sparkline.props.highlightIndex );
	} );
} );
