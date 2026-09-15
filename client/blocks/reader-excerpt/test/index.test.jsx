/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ReaderExcerpt from '../index';

// jsdom does not implement `innerText`, which the daily prompt lookup relies on.
beforeAll( () => {
	Object.defineProperty( window.HTMLElement.prototype, 'innerText', {
		configurable: true,
		get() {
			return this.textContent;
		},
	} );
} );

const dailyPromptPost = ( { content, excerpt } ) => ( {
	ID: 1,
	site_ID: 1,
	tags: { dailyprompt: { ID: 1, name: 'dailyprompt', slug: 'dailyprompt' } },
	content,
	excerpt,
} );

describe( 'ReaderExcerpt', () => {
	it( 'renders the daily prompt as a pullquote ahead of the excerpt', () => {
		const post = dailyPromptPost( {
			content:
				'<figure class="wp-block-pullquote"><blockquote><p>What is your favorite color?</p></blockquote></figure><p>Blue.</p>',
			excerpt: 'What is your favorite color? Blue.',
		} );

		const { container } = render( <ReaderExcerpt post={ post } /> );

		expect( container.querySelector( '.wp-block-pullquote' ) ).toHaveTextContent(
			'What is your favorite color?'
		);
		expect( screen.getByText( /Blue\./ ) ).toBeVisible();
	} );

	it( 'keeps entity-encoded markup in the daily prompt inert', () => {
		const post = dailyPromptPost( {
			content:
				'<figure class="wp-block-pullquote"><blockquote><p>Prompt &lt;img src=x-reader-proof onerror=&quot;document.documentElement.dataset.readerProof = `proof`&quot;&gt; suffix</p></blockquote></figure><p>Ordinary public post body.</p>',
			excerpt: 'Prompt suffix Ordinary public post body.',
		} );

		const { container } = render( <ReaderExcerpt post={ post } /> );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( '[onerror]' ) ).toBeNull();
		expect( document.documentElement.dataset.readerProof ).toBeUndefined();
		// The prompt is text: it renders as text, and creates no child element of its own.
		expect( container.querySelector( '.wp-block-pullquote' ).children ).toHaveLength( 0 );
		expect( container.querySelector( '.wp-block-pullquote' ) ).toHaveTextContent(
			'Prompt <img src=x-reader-proof onerror="document.documentElement.dataset.readerProof = `proof`"> suffix'
		);
	} );

	it( 'falls back to the excerpt when the pullquote is not the first child', () => {
		const post = dailyPromptPost( {
			content:
				'<p>Intro.</p><figure class="wp-block-pullquote"><blockquote><p>Prompt &lt;img src=x onerror=&quot;window.readerProof = 1&quot;&gt;</p></blockquote></figure>',
			excerpt: 'Intro. Prompt',
		} );

		const { container } = render( <ReaderExcerpt post={ post } /> );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( '.wp-block-pullquote' ) ).toBeNull();
		expect( screen.getByText( /Intro\./ ) ).toBeVisible();
	} );

	it( 'ignores the pullquote when the post is not tagged dailyprompt', () => {
		const post = {
			ID: 1,
			site_ID: 1,
			tags: {},
			content:
				'<figure class="wp-block-pullquote"><blockquote><p>Prompt &lt;img src=x onerror=&quot;window.readerProof = 1&quot;&gt;</p></blockquote></figure>',
			excerpt: 'Prompt',
		};

		const { container } = render( <ReaderExcerpt post={ post } /> );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( '.wp-block-pullquote' ) ).toBeNull();
	} );
} );
