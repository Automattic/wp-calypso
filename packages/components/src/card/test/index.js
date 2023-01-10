/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Card from '../';
import CompactCard from '../compact';

describe( 'Card', () => {
	// it should have a class of `card`
	test( 'should render properly and match snapshot', () => {
		const { container } = render( <Card /> );

		expect( container.firstChild ).toBeVisible();
		expect( container.firstChild ).toMatchSnapshot();
	} );

	// it should accept a custom class of `test__ace`
	test( 'should have custom class of `test__ace`', () => {
		const { container } = render( <Card className="test__ace" /> );

		expect( container.firstChild ).toHaveClass( 'test__ace' );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	// check that content within a card renders correctly
	test( 'should render children', () => {
		const { container } = render( <Card>This is a card</Card> );

		expect( container.firstChild ).toHaveTextContent( 'This is a card' );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	// check it will accept a href
	test( 'should be linkable', () => {
		const { container } = render( <Card href="/test">This is a linked card</Card> );

		const link = screen.getByRole( 'link', { name: 'This is a linked card' } );

		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', '/test' );
		expect( link ).toHaveClass( 'is-card-link' );
		expect( container.firstChild ).toMatchSnapshot();

		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	// check that it can be rendered as a clickable button displaying as a link
	test( 'should render as a clickable button which looks like a link', () => {
		const { container } = render(
			<Card tagName="button" displayAsLink onClick={ () => {} }>
				This is a button which looks like a link
			</Card>
		);

		const card = screen.getByRole( 'button', { name: 'This is a button which looks like a link' } );

		expect( card.tagName ).toBe( 'BUTTON' );
		expect( card ).toHaveClass( 'is-card-link' );
		expect( card ).toHaveClass( 'is-clickable' );
		expect( container.firstChild ).toMatchSnapshot();

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'CompactCard', () => {
	// the inner `Card` should have a `compact` prop
	test( 'should have `compact` prop', () => {
		const { container } = render( <CompactCard /> );

		expect( container.firstChild ).toHaveClass( 'is-compact' );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	// it should accept a custom class of `test__ace`
	test( 'should have custom class of `test__ace`', () => {
		const { container } = render( <CompactCard className="test__ace" /> );

		expect( container.firstChild ).toHaveClass( 'test__ace' );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	// check that content within a CompactCard renders correctly
	test( 'should render children', () => {
		const { container } = render( <CompactCard>This is a compact card</CompactCard> );
		expect( container.firstChild ).toHaveTextContent( 'This is a compact card' );
		expect( container.firstChild ).toMatchSnapshot();
	} );

	// test for card component
	test( 'should use the card component', () => {
		const { container } = render( <CompactCard /> );

		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).toMatchSnapshot();
	} );
} );
