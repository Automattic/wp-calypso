/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCardEmbedExternal } from '../post-card-embed-external';
import type { SocialEmbedExternal, SocialLongForm } from '../../../types';

const embed: SocialEmbedExternal = {
	type: 'external',
	uri: 'https://example.com/article',
	title: 'Title',
	description: 'Description',
	thumb: 'https://example.com/thumb.jpg',
};

const longForm: SocialLongForm = {
	document: {
		title: 'Signing homework',
		description: 'Signing my daughter’s Chinese writing test.',
		text_content:
			'I’ve reached the point when it’s getting hard to keep up with homework.\n\nNot sure my signature means much.',
		path: '/signing-homework/',
		tags: [ 'Chinese' ],
		published_at: '2026-05-24T11:10:11Z',
	},
	publication: {
		name: 'Herve Family',
		display_name: 'Herve Family',
		description: 'Our family’s website',
		url: 'https://herve.bzh/',
	},
};

describe( 'PostCardEmbedExternal', () => {
	it( 'renders a link to the external URI', () => {
		render( <PostCardEmbedExternal embed={ embed } parentPostUri="at://post" /> );
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', embed.uri );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
	} );

	it( 'renders title, description and host', () => {
		render( <PostCardEmbedExternal embed={ embed } parentPostUri="at://post" /> );
		expect( screen.getByText( 'Title' ) ).toBeVisible();
		expect( screen.getByText( 'Description' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
	} );

	it( 'renders without a thumbnail when thumb is null', () => {
		const { container } = render(
			<PostCardEmbedExternal embed={ { ...embed, thumb: null } } parentPostUri="at://post" />
		);
		expect( container.querySelector( 'img' ) ).toBeNull();
	} );

	describe( 'long-form decoration', () => {
		it( 'does not render the long-form toggle when long_form is absent', () => {
			render( <PostCardEmbedExternal embed={ embed } parentPostUri="at://post" /> );
			expect(
				screen.queryByRole( 'button', { name: /Read article on/i } )
			).not.toBeInTheDocument();
		} );

		it( 'renders the long-form toggle, collapsed by default, when long_form is present', () => {
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);
			const toggle = screen.getByRole( 'button', { name: /Read article on Herve Family/i } );
			expect( toggle ).toBeVisible();
			expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
			// Body must not be rendered before the user expands it.
			expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
		} );

		it( 'wires aria-controls on the toggle to the article panel id', async () => {
			// WAI-ARIA disclosure pattern: the toggle owns the panel via
			// `aria-controls`, so assistive tech can announce the controlled
			// region by id and follow the relationship.
			const user = userEvent.setup();
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);
			const toggle = screen.getByRole( 'button', { name: /Read article on Herve Family/i } );
			const panelId = toggle.getAttribute( 'aria-controls' );
			expect( panelId ).toBeTruthy();

			await user.click( toggle );
			const panel = document.getElementById( panelId as string );
			expect( panel ).not.toBeNull();
			expect( panel?.tagName ).toBe( 'ARTICLE' );
		} );

		it( 'expands to show the article body and a "View original" link when the toggle is clicked', async () => {
			const user = userEvent.setup();
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);

			await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );

			expect( screen.getByRole( 'button', { name: /Hide article/i } ) ).toHaveAttribute(
				'aria-expanded',
				'true'
			);

			// The text body is split into paragraphs on blank lines; both
			// paragraphs must render with their original text.
			expect(
				screen.getByText( /I’ve reached the point when it’s getting hard to keep up/i )
			).toBeVisible();
			expect( screen.getByText( /Not sure my signature means much\./i ) ).toBeVisible();

			// The "View original" link must point at `publication.url` +
			// `document.path` with a single slash join and the standard
			// off-site link hardening.
			const original = screen.getByRole( 'link', { name: /View original on Herve Family/i } );
			expect( original ).toHaveAttribute( 'href', 'https://herve.bzh/signing-homework/' );
			expect( original ).toHaveAttribute( 'target', '_blank' );
			expect( original ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		} );

		it( 'collapses again when the toggle is clicked a second time', async () => {
			const user = userEvent.setup();
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);

			const toggle = screen.getByRole( 'button', { name: /Read article on Herve Family/i } );
			await user.click( toggle );
			await user.click( screen.getByRole( 'button', { name: /Hide article/i } ) );

			expect(
				screen.getByRole( 'button', { name: /Read article on Herve Family/i } )
			).toHaveAttribute( 'aria-expanded', 'false' );
			expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
		} );

		it( 'renders an empty-state line when text_content is empty', async () => {
			const user = userEvent.setup();
			const emptyLongForm: SocialLongForm = {
				...longForm,
				document: { ...longForm.document, text_content: '' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: emptyLongForm } }
					parentPostUri="at://post"
				/>
			);
			await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );

			expect(
				screen.getByText( /No preview text is available for this article\./i )
			).toBeVisible();
		} );

		it( 'falls back to publication.name when display_name is empty', () => {
			const fallbackLongForm: SocialLongForm = {
				...longForm,
				publication: { ...longForm.publication, display_name: '' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: fallbackLongForm } }
					parentPostUri="at://post"
				/>
			);
			expect(
				screen.getByRole( 'button', { name: /Read article on Herve Family/i } )
			).toBeVisible();
		} );

		it( 'does not render the long-form decoration in compact mode (quote embed)', () => {
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
					compact
				/>
			);
			expect(
				screen.queryByRole( 'button', { name: /Read article on/i } )
			).not.toBeInTheDocument();
		} );

		it( 'strips a trailing slash from publication.url before joining with document.path', async () => {
			const user = userEvent.setup();
			const messyLongForm: SocialLongForm = {
				...longForm,
				publication: { ...longForm.publication, url: 'https://herve.bzh///' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: messyLongForm } }
					parentPostUri="at://post"
				/>
			);
			await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
			const original = screen.getByRole( 'link', { name: /View original on Herve Family/i } );
			expect( original ).toHaveAttribute( 'href', 'https://herve.bzh/signing-homework/' );
		} );
	} );
} );
