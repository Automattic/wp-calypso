/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Card from '../';
import CompactCard from '../compact';

describe( 'Card', () => {
	// it should have a class of `card`
	it( 'should have `card` class', () => {
		const card = shallow( <Card /> );
		expect( card.is( '.card' ) ).to.equal( true );
	} );

	// it should accept a custom class of `test__ace`
	it( 'should have custom class of `test__ace`', () => {
		const card = shallow( <Card className="test__ace" /> );
		expect( card.is( '.test__ace' ) ).to.equal( true );
	} );

	// check that content within a card renders correctly
	it( 'should render children', () => {
		const card = shallow( <Card>This is a card</Card> );
		expect( card.contains( 'This is a card' ) ).to.equal( true );
	} );

	// check it will accept a href
	it( 'should be linkable', () => {
		const card = shallow( <Card href="/test">This is a linked card</Card> );
		expect( card.find( 'a[href="/test"]' ) ).to.have.length( 1 );
		expect( card.props().href ).to.equal( '/test' );
		expect( card.is( '.is-card-link' ) ).to.equal( true );
	} );
} );

describe( 'CompactCard', () => {
	// it should have a class of `is-compact`
	it( 'should have `is-compact` class', () => {
		const compactCard = shallow( <CompactCard /> );
		expect( compactCard.find( '.is-compact' ) ).to.have.length( 1 );
	} );

	// it should accept a custom class of `test__ace`
	it( 'should have custom class of `test__ace`', () => {
		const compactCard = shallow( <CompactCard className="test__ace" /> );
		expect( compactCard.is( '.test__ace' ) ).to.equal( true );
	} );

	// check that content within a card renders correctly
	it( 'should render children', () => {
		const compactCard = shallow( <CompactCard>This is a compact card</CompactCard> );
		expect( compactCard.contains( 'This is a compact card' ) ).to.equal( true );
	} );

	// test for card component
	it( 'should use the card component', () => {
		const compactCard = shallow( <CompactCard /> );
		expect( compactCard.find( 'Card' ) ).to.have.length( 1 );
	} );
} );
