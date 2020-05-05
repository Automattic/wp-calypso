/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import Gridicon from 'components/gridicon';
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from '../index';

describe( 'External Link', () => {
	test( 'should have external-link class', () => {
		const externalLink = shallow( <ExternalLink /> );
		assert.lengthOf( externalLink.find( '.external-link' ), 1 );
	} );

	test( 'should have className if provided', () => {
		const externalLink = shallow( <ExternalLink className="test__foobar" /> );
		assert.lengthOf( externalLink.find( '.test__foobar' ), 1 );
	} );

	test( 'should have href if provided', () => {
		const externalLink = shallow( <ExternalLink href="http://foobar.bang" /> );
		assert.lengthOf( externalLink.find( { href: 'http://foobar.bang' } ), 1 );
	} );

	test( 'should have icon if provided', () => {
		const externalLink = shallow( <ExternalLink icon={ true } /> );
		assert.lengthOf( externalLink.find( Gridicon ), 1 );
	} );

	test( 'should have a target if given one', () => {
		const externalLink = shallow( <ExternalLink target="_blank" /> );
		assert.lengthOf( externalLink.find( { target: '_blank' } ), 1 );
	} );

	test( 'should have an icon className if specified', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconClassName="foo" /> );
		assert.equal( 'foo', externalLink.find( Gridicon ).prop( 'className' ) );
	} );

	test( 'should have an icon default size of 18', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconClassName="foo" /> );
		assert.equal( '18', externalLink.find( Gridicon ).prop( 'size' ) );
	} );

	test( 'should have an icon size that is provided', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconSize={ 20 } /> );
		assert.equal( '20', externalLink.find( Gridicon ).prop( 'size' ) );
	} );

	test( 'should have icon first if specified', () => {
		const externalLink = shallow( <ExternalLink icon={ true } iconClassName="foo" /> );
		assert.isTrue( externalLink.children().first().is( Gridicon ) );
	} );
} );
