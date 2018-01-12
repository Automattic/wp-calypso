/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import HorizontalBar from '../index';

describe( 'HorizontalBar', () => {
	test( 'should render a bar with correct dimensions', () => {
		const width = 34;
		const height = 15;
		const bar = mount(
			<HorizontalBar width={ width } height={ height } data={ 10 } extent={ [ 0, 10 ] } />
		);
		const rect = bar.render().find( 'rect' );
		const rectAttribures = rect.attr();
		assert.equal( rectAttribures.width, width );
		assert.equal( rectAttribures.height, height );
	} );

	test( 'should render a bar with correctly scaled width', () => {
		const width = 10;
		const data = 50;
		const dataMax = 100;
		const extent = [ 0, dataMax ];
		const bar = mount( <HorizontalBar width={ width } data={ data } extent={ extent } /> );
		const correctWidth = data / dataMax * width;
		const rectAttribures = bar
			.render()
			.find( 'rect' )
			.attr();
		assert.equal( rectAttribures.width, correctWidth );
	} );

	test( 'should render text within the bar if there is room', () => {
		const width = 100;
		const data = 100;
		const dataMax = 100;
		const extent = [ 0, dataMax ];
		const bar = mount( <HorizontalBar width={ width } data={ data } extent={ extent } /> );
		const textAttribures = bar
			.render()
			.find( 'text' )
			.attr();
		assert.equal( textAttribures[ 'text-anchor' ], 'end' );
	} );

	test( 'should render text outside the bar if there is no room', () => {
		const width = 100;
		const data = 0.001;
		const dataMax = 100;
		const extent = [ 0, dataMax ];
		const bar = mount( <HorizontalBar width={ width } data={ data } extent={ extent } /> );
		const textAttribures = bar
			.render()
			.find( 'text' )
			.attr();
		assert.equal( textAttribures[ 'text-anchor' ], 'start' );
	} );

	test( 'should render text currency formatted if supplied', () => {
		const width = 100;
		const data = 0.001;
		const dataMax = 100;
		const extent = [ 0, dataMax ];
		const bar = mount(
			<HorizontalBar width={ width } data={ data } extent={ extent } currency="NZD" />
		);
		const text = bar
			.render()
			.find( 'text' )
			.text();
		assert.match( text, /NZ\$\d/ );
	} );
} );
