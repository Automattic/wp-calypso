/**
 * @vitest-environment jsdom
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

	it( 'removes styles, ids and form controls from comment markup', () => {
		const { container } = render(
			<PostCommentContent
				content={
					'<p>Hi <strong>there</strong> <a href="https://example.com/">link</a></p>' +
					'<div id="overlay" name="box" style="position:fixed;inset:0;z-index:99999">Boxed text</div>' +
					'<style>p { color: red; }</style>' +
					'<form action="https://example.com/"><input name="q"><button>Send</button></form>'
				}
			/>
		);
		const rendered = container.querySelector( '.comments__comment-content' );

		expect( rendered.innerHTML ).toBe(
			'<p>Hi <strong>there</strong> <a href="https://example.com/">link</a></p>' +
				'<div>Boxed text</div>Send'
		);
	} );

	it( 'keeps an embed, sandboxed', () => {
		const { container } = render( <PostCommentContent content={ content } /> );

		expect( container.querySelector( 'iframe' ) ).toHaveAttribute(
			'sandbox',
			'allow-same-origin allow-scripts allow-popups'
		);
	} );
} );
