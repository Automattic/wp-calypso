/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import PostCommentContent from '../post-comment-content';

describe( 'PostCommentContent', () => {
	it( 'shows a pending plain-text comment as text', () => {
		render( <PostCommentContent isPlaceholder content="<b>Hi</b>" /> );

		expect( screen.getByText( '<b>Hi</b>' ) ).toBeVisible();
	} );

	it( 'renders a pending block-editor comment instead of showing its markup', () => {
		const { container } = render(
			<PostCommentContent
				isPlaceholder
				content={
					'<!-- wp:paragraph --><p>Hello blocks</p><!-- /wp:paragraph -->' +
					'<!-- wp:list --><ul><li>an item</li></ul><!-- /wp:list -->'
				}
			/>
		);

		expect( screen.getByText( 'Hello blocks' ) ).toBeVisible();
		expect( screen.getByRole( 'listitem' ) ).toHaveTextContent( 'an item' );
		expect( container ).not.toHaveTextContent( 'wp:paragraph' );
	} );

	it( 'sanitizes a pending block-editor comment', () => {
		const { container } = render(
			<PostCommentContent
				isPlaceholder
				content='<!-- wp:paragraph --><p>Hi<img src="x" onerror="alert(1)"><script>alert(2)</script></p><!-- /wp:paragraph -->'
			/>
		);

		expect( container.querySelector( 'script' ) ).toBeNull();
		expect( container.querySelector( 'img' ) ).not.toHaveAttribute( 'onerror' );
	} );
} );
