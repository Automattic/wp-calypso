/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialAnalyticsProvider, type SocialAnalyticsContextValue } from '../analytics-context';
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
		cover_image:
			'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:4i6hvdii3km3kbnj3losmwnt/bafyreicoverimage',
	},
	publication: {
		name: 'Herve Family',
		display_name: 'Herve Family',
		description: 'Our family’s website',
		url: 'https://herve.bzh/',
		handle: 'jeremy.herve.bzh',
		avatar:
			'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:4i6hvdii3km3kbnj3losmwnt/bafyreiavatar',
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

		describe( 'cover image hero', () => {
			it( 'renders the cover image as a full-width hero when long_form.document.cover_image is set', () => {
				const { container } = render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: longForm } }
						parentPostUri="at://post"
					/>
				);

				const cover = container.querySelector( '.social-post-card-embed-external__cover' );
				expect( cover ).not.toBeNull();
				expect( cover ).toHaveAttribute( 'src', longForm.document.cover_image );
				expect( cover ).toHaveAttribute( 'loading', 'lazy' );

				// The small left-side thumb layout must NOT render when the
				// hero swap is active — the cover replaces it.
				expect( container.querySelector( '.social-post-card-embed-external__thumb' ) ).toBeNull();
			} );

			it( 'falls back to the small-thumb layout when cover_image is null', () => {
				const noCover = {
					...longForm,
					document: { ...longForm.document, cover_image: null },
				};
				const { container } = render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: noCover } }
						parentPostUri="at://post"
					/>
				);

				expect( container.querySelector( '.social-post-card-embed-external__cover' ) ).toBeNull();
				// `embed.thumb` is set on the base fixture, so the small thumb renders here.
				expect(
					container.querySelector( '.social-post-card-embed-external__thumb' )
				).not.toBeNull();
			} );

			it( 'does not swap to the hero layout in compact (quote embed) mode', () => {
				// Even when the long_form payload carries a cover, the quote
				// embed keeps the compact small-thumb layout — the hero strip
				// would compete with the surrounding quote chrome.
				const { container } = render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: longForm } }
						parentPostUri="at://post"
						compact
					/>
				);

				expect( container.querySelector( '.social-post-card-embed-external__cover' ) ).toBeNull();
			} );
		} );

		describe( 'publication pill', () => {
			it( 'renders the publication name, handle, avatar and "View publication" link', () => {
				const { container } = render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: longForm } }
						parentPostUri="at://post"
					/>
				);

				const avatar = container.querySelector(
					'.social-post-card-embed-external__publication-pill-avatar'
				);
				expect( avatar ).not.toBeNull();
				expect( avatar ).toHaveAttribute( 'src', longForm.publication.avatar );
				expect( avatar ).toHaveAttribute( 'width', '24' );

				expect( screen.getByText( 'Herve Family' ) ).toBeVisible();
				expect( screen.getByText( /by @jeremy\.herve\.bzh/i ) ).toBeVisible();

				const viewLink = screen.getByRole( 'link', { name: /View publication/i } );
				expect( viewLink ).toHaveAttribute( 'href', 'https://herve.bzh/' );
				expect( viewLink ).toHaveAttribute( 'target', '_blank' );
				expect( viewLink ).toHaveAttribute( 'rel', 'noopener noreferrer' );
			} );

			it( 'omits the handle line when publication.handle is empty', () => {
				const noHandle = {
					...longForm,
					publication: { ...longForm.publication, handle: '' },
				};
				render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: noHandle } }
						parentPostUri="at://post"
					/>
				);
				expect( screen.queryByText( /^by @/i ) ).not.toBeInTheDocument();
				// Other pill cells still render.
				expect( screen.getByText( 'Herve Family' ) ).toBeVisible();
			} );

			it( 'omits the avatar when publication.avatar is null', () => {
				const noAvatar = {
					...longForm,
					publication: { ...longForm.publication, avatar: null },
				};
				const { container } = render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: noAvatar } }
						parentPostUri="at://post"
					/>
				);
				expect(
					container.querySelector( '.social-post-card-embed-external__publication-pill-avatar' )
				).toBeNull();
				expect( screen.getByText( 'Herve Family' ) ).toBeVisible();
			} );

			it( 'does not render the pill at all when every publication field is empty', () => {
				const emptyPub = {
					...longForm,
					publication: {
						name: '',
						display_name: '',
						description: '',
						url: '',
						handle: '',
						avatar: null,
					},
				};
				render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: emptyPub } }
						parentPostUri="at://post"
					/>
				);
				expect(
					screen.queryByRole( 'link', { name: /View publication/i } )
				).not.toBeInTheDocument();
			} );

			it( 'falls back to publication.name in the pill when display_name is empty', () => {
				const fallback = {
					...longForm,
					publication: { ...longForm.publication, display_name: '' },
				};
				render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: fallback } }
						parentPostUri="at://post"
					/>
				);
				expect( screen.getByText( 'Herve Family' ) ).toBeVisible();
			} );
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

		it( 'inserts a leading slash if document.path is missing one', async () => {
			const user = userEvent.setup();
			const slashlessLongForm: SocialLongForm = {
				...longForm,
				document: { ...longForm.document, path: 'signing-homework/' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: slashlessLongForm } }
					parentPostUri="at://post"
				/>
			);
			await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
			const original = screen.getByRole( 'link', { name: /View original on Herve Family/i } );
			expect( original ).toHaveAttribute( 'href', 'https://herve.bzh/signing-homework/' );
		} );

		it( 'falls back to embed.uri when document.path is empty', async () => {
			const user = userEvent.setup();
			const pathlessLongForm: SocialLongForm = {
				...longForm,
				document: { ...longForm.document, path: '' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: pathlessLongForm } }
					parentPostUri="at://post"
				/>
			);
			await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
			const original = screen.getByRole( 'link', { name: /View original on Herve Family/i } );
			expect( original ).toHaveAttribute( 'href', embed.uri );
		} );

		it( 'falls back to the publication host when both display_name and name are empty', () => {
			const hostFallbackLongForm: SocialLongForm = {
				...longForm,
				publication: { ...longForm.publication, display_name: '', name: '' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: hostFallbackLongForm } }
					parentPostUri="at://post"
				/>
			);
			expect( screen.getByRole( 'button', { name: /Read article on herve\.bzh/i } ) ).toBeVisible();
		} );

		it( 'drops the publication suffix when display_name, name, and host are all empty', () => {
			const namelessLongForm: SocialLongForm = {
				...longForm,
				publication: { display_name: '', name: '', description: '', url: '' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: namelessLongForm } }
					parentPostUri="at://post"
				/>
			);
			const toggle = screen.getByRole( 'button', { name: 'Read article' } );
			expect( toggle ).toBeVisible();
		} );

		it( 'renders a single paragraph when text_content has no blank lines', async () => {
			const user = userEvent.setup();
			const onePara: SocialLongForm = {
				...longForm,
				document: { ...longForm.document, text_content: 'Single paragraph, no break.' },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: onePara } }
					parentPostUri="at://post"
				/>
			);
			await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
			expect( screen.getByText( 'Single paragraph, no break.' ) ).toBeVisible();
		} );

		it( 'collapses multiple blank lines and whitespace-only paragraphs without emitting empty <p>', async () => {
			const user = userEvent.setup();
			const messyText: SocialLongForm = {
				...longForm,
				document: {
					...longForm.document,
					text_content: 'First paragraph.\n\n\n   \n\nSecond paragraph.',
				},
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: messyText } }
					parentPostUri="at://post"
				/>
			);
			await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
			const article = screen.getByRole( 'article' );
			const paragraphs = article.querySelectorAll( 'p' );
			// Two real paragraphs + the trailing "View original" link is an <a>, not a <p>.
			expect( paragraphs ).toHaveLength( 2 );
			expect( paragraphs[ 0 ] ).toHaveTextContent( 'First paragraph.' );
			expect( paragraphs[ 1 ] ).toHaveTextContent( 'Second paragraph.' );
		} );

		describe( 'analytics', () => {
			function renderWithAnalytics( overrides?: Partial< SocialAnalyticsContextValue > ) {
				const onClick = jest.fn();
				const value: SocialAnalyticsContextValue = {
					source: 'atmosphere',
					connectionId: 42,
					onClick,
					...overrides,
				};
				render(
					<SocialAnalyticsProvider value={ value }>
						<PostCardEmbedExternal
							embed={ { ...embed, long_form: longForm } }
							parentPostUri="at://post/1"
						/>
					</SocialAnalyticsProvider>
				);
				return { onClick };
			}

			it( 'fires long_form_expanded on first toggle click', async () => {
				const user = userEvent.setup();
				const { onClick } = renderWithAnalytics();
				await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
				expect( onClick ).toHaveBeenCalledWith( 'calypso_reader_atmosphere_long_form_expanded', {
					connection_id: 42,
					post_uri: 'at://post/1',
					external_uri: embed.uri,
				} );
			} );

			it( 'fires long_form_collapsed on second toggle click', async () => {
				const user = userEvent.setup();
				const { onClick } = renderWithAnalytics();
				await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
				await user.click( screen.getByRole( 'button', { name: /Hide article/i } ) );
				expect( onClick ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_long_form_collapsed',
					expect.objectContaining( {
						connection_id: 42,
						post_uri: 'at://post/1',
						external_uri: embed.uri,
					} )
				);
			} );

			it( 'fires long_form_original_clicked when the original link is clicked', async () => {
				const user = userEvent.setup();
				const { onClick } = renderWithAnalytics();
				await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
				await user.click( screen.getByRole( 'link', { name: /View original on Herve Family/i } ) );
				expect( onClick ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_long_form_original_clicked',
					{
						connection_id: 42,
						post_uri: 'at://post/1',
						external_uri: embed.uri,
					}
				);
			} );

			it( 'fires long_form_publication_clicked when the View publication link is clicked', async () => {
				const user = userEvent.setup();
				const { onClick } = renderWithAnalytics();
				await user.click( screen.getByRole( 'link', { name: /View publication/i } ) );
				expect( onClick ).toHaveBeenCalledWith(
					'calypso_reader_atmosphere_long_form_publication_clicked',
					{
						connection_id: 42,
						post_uri: 'at://post/1',
						external_uri: embed.uri,
					}
				);
			} );

			it( 'does not throw when no analytics provider is mounted', async () => {
				const user = userEvent.setup();
				render(
					<PostCardEmbedExternal
						embed={ { ...embed, long_form: longForm } }
						parentPostUri="at://post"
					/>
				);
				await user.click( screen.getByRole( 'button', { name: /Read article on Herve Family/i } ) );
				expect( screen.getByRole( 'button', { name: /Hide article/i } ) ).toBeVisible();
			} );
		} );
	} );
} );
