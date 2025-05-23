/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Callout } from '../index';

describe( 'Callout', () => {
	test( 'renders title and description', () => {
		render( <Callout title="Test Title" description={ <p>Helpful content</p> } /> );
		expect(
			screen.getByRole( 'heading', {
				name: 'Test Title',
			} )
		).toBeInTheDocument();
		expect( screen.getByRole( 'paragraph' ) ).toHaveTextContent( 'Helpful content' );
	} );

	test( 'renders img element using imageSrc', () => {
		render(
			<Callout
				title="Test Title"
				description={ <p>Helpful content</p> }
				imageSrc="https://example.com/illustration.png"
				imageAlt="Illustration"
			/>
		);
		expect( screen.getByRole( 'img', { name: 'Illustration' } ) ).toHaveAttribute(
			'src',
			'https://example.com/illustration.png'
		);
	} );
} );
