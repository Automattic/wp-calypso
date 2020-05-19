/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { merge } from 'lodash';

describe( 'Head', () => {
	let Head;

	const createProps = ( additionalProps ) =>
		merge(
			{
				cdn: '//arbitrary-cdn',
				faviconURL: 'https://arbitrary-favicon-url',
			},
			additionalProps
		);

	beforeAll( () => {
		Head = require( '../' );
	} );

	test( 'should render default title', () => {
		const props = createProps();
		const wrapper = shallow( <Head { ...props } /> );

		expect( wrapper.find( 'title' ).text() ).toBe( 'WordPress.com' );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render custom title', () => {
		const props = createProps( { title: 'Arbitrary Custom Title' } );
		const wrapper = shallow( <Head { ...props } /> );

		expect( wrapper.find( 'title' ).text() ).toBe( 'Arbitrary Custom Title' );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( "render use 'faviconURL' for relevant <link /> tags ", () => {
		const props = createProps();
		const wrapper = shallow( <Head { ...props } /> );

		expect(
			wrapper.find( { rel: 'shortcut icon', type: 'image/vnd.microsoft.icon' } ).prop( 'href' )
		).toEqual( props.faviconURL );
		expect( wrapper.find( { rel: 'shortcut icon', type: 'image/x-icon' } ).prop( 'href' ) ).toEqual(
			props.faviconURL
		);
		expect( wrapper.find( { rel: 'icon', type: 'image/x-icon' } ).prop( 'href' ) ).toEqual(
			props.faviconURL
		);
	} );

	test( "should use 'cdn' to construct relevant <link /> tags", () => {
		const props = createProps( { cdn: '//s1.wp.com' } );
		const wrapper = shallow( <Head { ...props } /> );

		wrapper.find( { rel: 'icon', type: 'image/png' } ).map( ( link ) => {
			expect( link.prop( 'href' ) ).toMatch( /^\/\/s1.wp.com/ );
		} );
		wrapper.find( { rel: 'apple-touch-icon' } ).map( ( link ) => {
			expect( link.prop( 'href' ) ).toMatch( /^\/\/s1.wp.com/ );
		} );
	} );
} );
