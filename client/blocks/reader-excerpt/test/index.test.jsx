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
				'<figure class="wp-block-pullquote"><blockquote><p>Prompt &lt;img src=x onerror=&quot;window.readerProof = 1&quot;&gt; suffix</p></blockquote></figure><p>Ordinary public post body.</p>',
			excerpt: 'Prompt suffix Ordinary public post body.',
		} );

		const { container } = render( <ReaderExcerpt post={ post } /> );

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( '[onerror]' ) ).toBeNull();
		// The prompt is text: it renders as text, and creates no child element of its own.
		expect( container.querySelector( '.wp-block-pullquote' ).children ).toHaveLength( 0 );
		expect( container.querySelector( '.wp-block-pullquote' ) ).toHaveTextContent(
			'Prompt <img src=x onerror="window.readerProof = 1"> suffix'
		);
	} );

	it( 'renders punctuation and entity text in the daily prompt verbatim', () => {
		const post = dailyPromptPost( {
			content:
				'<figure class="wp-block-pullquote"><blockquote><p>What&#39;s the &quot;right&quot; way to write &amp;amp; in HTML?</p></blockquote></figure><p>Carefully.</p>',
			excerpt: 'What\'s the "right" way to write &amp; in HTML? Carefully.',
		} );

		const { container } = render( <ReaderExcerpt post={ post } /> );

		// Quotes must not surface as entities, and `&amp;` must survive as literal text.
		expect( container.querySelector( '.wp-block-pullquote' ).textContent.trim() ).toBe(
			'What\'s the "right" way to write &amp; in HTML?'
		);
	} );

	it( 'keeps a right-to-left daily prompt right-to-left', () => {
		// Escaping the quotes as well would add enough Latin letters to `AutoDirection`'s sample to
		// outvote the Hebrew and lay this out left-to-right.
		const prompt = 'מה עדיף: "בית" או "דירה"?';
		const post = dailyPromptPost( {
			content: `<figure class="wp-block-pullquote"><blockquote><p>${ prompt }</p></blockquote></figure><p>בית.</p>`,
			excerpt: `${ prompt } בית.`,
		} );

		const { container } = render( <ReaderExcerpt post={ post } /> );

		expect( container.firstChild ).toHaveStyle( { direction: 'rtl' } );
	} );

	it( 'falls back to the excerpt when the pullquote is not the first child', () => {
		const post = dailyPromptPost( {
			content:
				'<p>Intro.</p><figure class="wp-block-pullquote"><blockquote><p>Prompt &lt;img src=x onerror=&quot;window.readerProof = 1&quot;&gt;</p></blockquote></figure>',
			excerpt: 'Intro. Prompt',
		} );

		const { container } = render( <ReaderExcerpt post={ post } /> );

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

		expect( container.querySelector( '.wp-block-pullquote' ) ).toBeNull();
		expect( container ).toHaveTextContent( 'Prompt' );
	} );
} );
