/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ListTags } from '../list-tags';

describe( 'ListTags', () => {
	test( 'renders tag pills with hashtag prefix', () => {
		render( <ListTags tags={ [ 'Food & Drink', 'Travel', 'Technology' ] } /> );

		expect( screen.getByText( '#Food & Drink' ) ).toBeVisible();
		expect( screen.getByText( '#Travel' ) ).toBeVisible();
		expect( screen.getByText( '#Technology' ) ).toBeVisible();
	} );

	test( 'renders nothing when tags array is empty', () => {
		const { container } = render( <ListTags tags={ [] } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'renders nothing when tags is undefined', () => {
		const { container } = render( <ListTags tags={ undefined } /> );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
