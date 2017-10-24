/** @format */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import Gridicon from 'gridicons';
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from '../index';

describe( 'External Link', () => {
	test( 'should have external-link class', () => {
		const externalLink = shallow( <ExternalLink /> );
		expect( externalLink.find( '.external-link' ).length ).toBe( 1 );
	} );

	test( 'should have className if provided', () => {
		const externalLink = shallow( <ExternalLink className="test__foobar" /> );
		expect( externalLink.find( '.test__foobar' ).length ).toBe( 1 );
	} );

	test( 'should have href if provided', () => {
		const externalLink = shallow( <ExternalLink href="http://foobar.bang" /> );
		expect( externalLink.find( { href: 'http://foobar.bang' } ).length ).toBe( 1 );
	} );

	test( 'should have icon if provided', () => {
		const externalLink = shallow( <ExternalLink icon={ true } /> );
		expect( externalLink.find( Gridicon ).length ).toBe( 1 );
	} );

	test( 'should have a target if given one', () => {
		const externalLink = shallow( <ExternalLink target="_blank" /> );
		expect( externalLink.find( { target: '_blank' } ).length ).toBe( 1 );
	} );

	test( 'should have an icon className if specified', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconClassName="foo" /> );
		expect( 'foo' ).toEqual( externalLink.find( Gridicon ).prop( 'className' ) );
	} );

	test( 'should have an icon default size of 18', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconClassName="foo" /> );
		expect( '18' ).toEqual( externalLink.find( Gridicon ).prop( 'size' ) );
	} );

	test( 'should have an icon size that is provided', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconSize={ 20 } /> );
		expect( '20' ).toEqual( externalLink.find( Gridicon ).prop( 'size' ) );
	} );

	test( 'should have icon first if specified', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconClassName="foo" /> );
		expect(
			externalLink
				.children()
				.first()
				.is( Gridicon )
		).toBe( true );
	} );
} );
