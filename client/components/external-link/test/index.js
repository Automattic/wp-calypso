/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import ExternalLink from '../index';

describe( 'External Link', () => {
	test( 'should have external-link class', () => {
		const { container } = render( <ExternalLink /> );
		expect( container.getElementsByClassName( 'external-link' ) ).toHaveLength( 1 );
	} );

	test( 'should have className if provided', () => {
		const { container } = render( <ExternalLink className="test__foobar" /> );
		expect( container.getElementsByClassName( 'test__foobar' ) ).toHaveLength( 1 );
	} );

	test( 'should have href if provided', () => {
		const { container } = render( <ExternalLink href="http://foobar.bang" /> );
		expect( container.getElementsByTagName( 'a' )[ 0 ].getAttribute( 'href' ) ).toEqual(
			'http://foobar.bang'
		);
	} );

	test( 'should have icon if provided', () => {
		const { container } = render( <ExternalLink icon={ true } /> );
		expect( container.getElementsByTagName( 'svg' ) ).toHaveLength( 1 );
	} );

	test( 'should have a target if given one', () => {
		const { container } = render( <ExternalLink target="_blank" /> );
		expect( container.getElementsByTagName( 'a' )[ 0 ].getAttribute( 'target' ) ).toEqual(
			'_blank'
		);
	} );

	test( 'should have an icon className if specified', () => {
		const { container } = render( <ExternalLink icon={ true } iconClassName="foo" /> );
		expect( container.querySelectorAll( 'svg.foo' ) ).toHaveLength( 1 );
	} );

	test( 'should have an icon default size of 18', () => {
		const { container } = render( <ExternalLink icon={ true } iconClassName="foo" /> );
		const gridicon = container.getElementsByTagName( 'svg' )[ 0 ];
		expect( gridicon.getAttribute( 'width' ) ).toEqual( '18' );
		expect( gridicon.getAttribute( 'height' ) ).toEqual( '18' );
	} );

	test( 'should have an icon size that is provided', () => {
		const { container } = render( <ExternalLink icon={ true } iconSize={ 20 } /> );
		const gridicon = container.getElementsByTagName( 'svg' )[ 0 ];
		expect( gridicon.getAttribute( 'width' ) ).toEqual( '20' );
		expect( gridicon.getAttribute( 'height' ) ).toEqual( '20' );
	} );

	test( 'should have icon first if specified', () => {
		const { container } = render( <ExternalLink icon={ true } iconClassName="foo" /> );
		expect( container.getElementsByTagName( 'a' )[ 0 ].children[ 0 ].tagName ).toEqual( 'svg' );
	} );
} );
