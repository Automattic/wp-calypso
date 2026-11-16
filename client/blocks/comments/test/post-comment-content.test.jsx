/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import PostCommentContent from '../post-comment-content';

const content =
	'<p>Watch this</p><iframe title="Video" src="https://www.youtube.com/embed/abc"></iframe>';

describe( 'PostCommentContent', () => {
	it( 'keeps an embed in place when it renders again with the same content', () => {
		const { container, rerender } = render( <PostCommentContent content={ content } /> );
		const iframe = container.querySelector( 'iframe' );

		rerender( <PostCommentContent content={ content } className="is-new" /> );

		expect( container.querySelector( 'iframe' ) ).toBe( iframe );
	} );

	it( 'renders new content when it changes', () => {
		const { container, rerender } = render( <PostCommentContent content={ content } /> );

		rerender( <PostCommentContent content="<p>Edited</p>" /> );

		expect( container.querySelector( 'iframe' ) ).toBeNull();
		expect( container ).toHaveTextContent( 'Edited' );
	} );
} );
