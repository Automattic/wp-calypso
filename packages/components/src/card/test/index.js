/**
 * External dependencies
 */
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
		expect( card.is( '.card' ) ).toBe( true );
		expect( card ).toMatchSnapshot();
	} );

	// it should accept a custom class of `test__ace`
	test( 'should have custom class of `test__ace`', () => {
		const card = shallow( <Card className="test__ace" /> );
		expect( card.is( '.test__ace' ) ).toBe( true );
		expect( card ).toMatchSnapshot();
	} );

	// check that content within a card renders correctly
	test( 'should render children', () => {
		const card = shallow( <Card>This is a card</Card> );
		expect( card.contains( 'This is a card' ) ).toBe( true );
		expect( card ).toMatchSnapshot();
	} );

	// check it will accept a href
	test( 'should be linkable', () => {
		const card = shallow( <Card href="/test">This is a linked card</Card> );
		expect( card.find( 'a[href="/test"]' ) ).toHaveLength( 1 );
		expect( card.props().href ).toBe( '/test' );
		expect( card.is( '.is-card-link' ) ).toBe( true );
		expect( card ).toMatchSnapshot();
	} );
	// check that it can be rendered as a clickable button displaying as a link
	test( 'should render as a clickable button which looks like a link', () => {
		const card = shallow(
			<Card tagName="button" displayAsLink onClick="test">
				This is a button which looks like a link
			</Card>
		);
		expect( card.is( 'a' ) ).toBe( false );
		expect( card.is( 'button' ) ).toBe( true );
		expect( card.is( '.is-card-link' ) ).toBe( true );
		expect( card.is( '.is-clickable' ) ).toBe( true );
		expect( card ).toMatchSnapshot();
	} );
} );

describe( 'CompactCard', () => {
	// the inner `Card` should have a `compact` prop
	test( 'should have `compact` prop', () => {
		const compactCard = shallow( <CompactCard /> );
		expect( compactCard.prop( 'compact' ) ).toBe( true );
		expect( compactCard ).toMatchSnapshot();
	} );

	// it should accept a custom class of `test__ace`
	test( 'should have custom class of `test__ace`', () => {
		const compactCard = shallow( <CompactCard className="test__ace" /> );
		expect( compactCard.is( '.test__ace' ) ).toBe( true );
		expect( compactCard ).toMatchSnapshot();
	} );

	// check that content within a CompactCard renders correctly
	test( 'should render children', () => {
		const compactCard = shallow( <CompactCard>This is a compact card</CompactCard> );
		expect( compactCard.contains( 'This is a compact card' ) ).toBe( true );
		expect( compactCard ).toMatchSnapshot();
	} );

	// test for card component
	test( 'should use the card component', () => {
		const compactCard = shallow( <CompactCard /> );
		expect( compactCard.find( 'Card' ) ).toHaveLength( 1 );
		expect( compactCard ).toMatchSnapshot();
	} );
} );
