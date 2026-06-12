/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardLink } from '../post-card-link';

describe( 'PostCardLink', () => {
	it( 'renders its children inside a position-relative wrapper', () => {
		const { container } = render(
			<PostCardLink variant="default">
				<div>body content</div>
			</PostCardLink>
		);
		expect( screen.getByText( 'body content' ) ).toBeVisible();
		expect( container.querySelector( '.social-post-card-link' ) ).not.toBeNull();
	} );

	it( 'applies a variant modifier class', () => {
		const { container } = render(
			<PostCardLink variant="default">
				<div>x</div>
			</PostCardLink>
		);
		expect(
			container.querySelector( '.social-post-card-link.social-post-card-link--default' )
		).not.toBeNull();
	} );
} );
