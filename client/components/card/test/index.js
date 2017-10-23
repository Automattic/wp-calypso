/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from '../';
import CompactCard from '../compact';

describe( 'Card', () => {
	// it should have a class of `card`
	test( 'should have `card` class', () => {
		const card = shallow( <Card /> );
		expect( card.is( '.card' ) ).to.equal( true );
	} );

	// it should accept a custom class of `test__ace`
	test( 'should have custom class of `test__ace`', () => {
		const card = shallow( <Card className="test__ace" /> );
		expect( card.is( '.test__ace' ) ).to.equal( true );
	} );

	// check that content within a card renders correctly
	test( 'should render children', () => {
		const card = shallow( <Card>This is a card</Card> );
		expect( card.contains( 'This is a card' ) ).to.equal( true );
	} );

	// check it will accept a href
	test( 'should be linkable', () => {
		const card = shallow( <Card href="/test">This is a linked card</Card> );
		expect( card.find( 'a[href="/test"]' ) ).to.have.length( 1 );
		expect( card.props().href ).to.equal( '/test' );
		expect( card.is( '.is-card-link' ) ).to.equal( true );
	} );
} );

describe( 'CompactCard', () => {
	// it should have a class of `is-compact`
	test( 'should have `is-compact` class', () => {
		const compactCard = shallow( <CompactCard /> );
		expect( compactCard.find( '.is-compact' ) ).to.have.length( 1 );
	} );

	// it should accept a custom class of `test__ace`
	test( 'should have custom class of `test__ace`', () => {
		const compactCard = shallow( <CompactCard className="test__ace" /> );
		expect( compactCard.is( '.test__ace' ) ).to.equal( true );
	} );

	// check that content within a card renders correctly
	test( 'should render children', () => {
		const compactCard = shallow( <CompactCard>This is a compact card</CompactCard> );
		expect( compactCard.contains( 'This is a compact card' ) ).to.equal( true );
	} );

	// test for card component
	test( 'should use the card component', () => {
		const compactCard = shallow( <CompactCard /> );
		expect( compactCard.find( 'Card' ) ).to.have.length( 1 );
	} );
} );
