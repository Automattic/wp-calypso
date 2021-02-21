/**
 * External dependencies
 */
import React from 'react';
import { render, shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import FormattedBlock, { FormattedBlockRenderer } from '..';

describe( 'FormattedBlock', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'displays string content as-is', () => {
		const content = 'my content';
		const block = render( <FormattedBlock content={ content } /> );

		expect( block.html() ).toEqual( content );
	} );

	test( 'displays content text as-is if there is no nested content and the content type is undefined', () => {
		const text = 'my content text';
		const block = render( <FormattedBlock content={ { text } } /> );

		expect( block.html() ).toEqual( text );
	} );

	test( 'displays nested content as FormattedBlocks if content type is not supported', () => {
		const onClick = jest.fn();
		const meta = {};
		const children = [
			'example1',
			{
				text: 'example2',
			},
			{
				children: [ 'example3a', 'example3b' ],
			},
		];

		const block = shallow(
			<FormattedBlock content={ { children } } onClick={ onClick } meta={ meta } />
		);

		expect( block.children().length ).toEqual( children.length );

		expect(
			block
				.children()
				.everyWhere(
					( child ) =>
						child.type() === FormattedBlock &&
						child.prop( 'onClick' ) === onClick &&
						child.prop( 'meta' ) === meta
				)
		).toEqual( true );
	} );

	test( 'displays the correct block with correct props if the content type is supported', () => {
		const MockBlockMapping = FormattedBlockRenderer( {
			myBlock: ( props ) => <div type="myfakeblock" { ...props }></div>,
		} );

		const onClick = jest.fn();
		const meta = {};
		const children = [ {}, {}, {} ];
		const content = { type: 'myBlock', children };

		const block = shallow(
			<MockBlockMapping content={ content } onClick={ onClick } meta={ meta } />
		);

		expect( block.type() ).toEqual( 'div' );
		expect( block.prop( 'content' ) ).toEqual( content );
		expect( block.prop( 'onClick' ) ).toEqual( onClick );
		expect( block.prop( 'meta' ) ).toEqual( meta );
		expect( block.children().length ).toEqual( children.length );
	} );
} );
