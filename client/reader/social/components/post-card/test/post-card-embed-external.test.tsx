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
		path: '/signing-homework/',
		published_at: '2026-05-24T11:10:11Z',
		cover_image:
			'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:4i6hvdii3km3kbnj3losmwnt/bafyreicoverimage',
		reading_time: 6,
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
	describe( 'plain external link (no long_form)', () => {
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

		it( 'does not render the publication pill when long_form is absent', () => {
			render( <PostCardEmbedExternal embed={ embed } parentPostUri="at://post" /> );
			expect( screen.queryByRole( 'link', { name: /View publication/i } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'long-form preview card', () => {
		it( 'renders the cover image as a full-width hero when document.cover_image is set', () => {
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
			// The small left-side thumb layout must NOT render alongside the hero.
			expect( container.querySelector( '.social-post-card-embed-external__thumb' ) ).toBeNull();
		} );

		it( 'renders the document title and description', () => {
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);
			expect( screen.getByText( 'Signing homework' ) ).toBeVisible();
			expect( screen.getByText( /Signing my daughter’s Chinese writing test\./i ) ).toBeVisible();
		} );

		it( 'links the preview card to the canonical article URL', () => {
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);
			const cardLink = screen.getByRole( 'link', { name: /Signing homework/i } );
			expect( cardLink ).toHaveAttribute( 'href', embed.uri );
			expect( cardLink ).toHaveAttribute( 'target', '_blank' );
			expect( cardLink ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		} );

		it( 'renders a published-date · reading-time meta line', () => {
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);
			expect( screen.getByText( 'May 24, 2026 · 6m' ) ).toBeVisible();
		} );

		it( 'omits the reading time when document.reading_time is null', () => {
			const noReadingTime: SocialLongForm = {
				...longForm,
				document: { ...longForm.document, reading_time: null },
			};
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: noReadingTime } }
					parentPostUri="at://post"
				/>
			);
			expect( screen.getByText( 'May 24, 2026' ) ).toBeVisible();
			expect( screen.queryByText( /6m/ ) ).not.toBeInTheDocument();
		} );

		it( 'omits the meta line entirely when published_at and reading_time are both empty', () => {
			const noMeta: SocialLongForm = {
				...longForm,
				document: { ...longForm.document, published_at: '', reading_time: null },
			};
			const { container } = render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: noMeta } }
					parentPostUri="at://post"
				/>
			);
			expect( container.querySelector( '.social-post-card-embed-external__meta' ) ).toBeNull();
		} );

		it( 'does not render the removed full-post reading view', () => {
			render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
				/>
			);
			expect( screen.queryByRole( 'button', { name: /Read article/i } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'article' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'link', { name: /View original/i } ) ).not.toBeInTheDocument();
		} );

		it( 'falls back to the plain small-thumb card in compact (quote embed) mode', () => {
			const { container } = render(
				<PostCardEmbedExternal
					embed={ { ...embed, long_form: longForm } }
					parentPostUri="at://post"
					compact
				/>
			);
			// No hero, no pill, no meta — just the slim plain card.
			expect( container.querySelector( '.social-post-card-embed-external__cover' ) ).toBeNull();
			expect( container.querySelector( '.social-post-card-embed-external__meta' ) ).toBeNull();
			expect( screen.queryByRole( 'link', { name: /View publication/i } ) ).not.toBeInTheDocument();
			expect( container.querySelector( '.social-post-card-embed-external__thumb' ) ).not.toBeNull();
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
				// `ExternalLink` hardens rel with the off-site tokens.
				const rel = viewLink.getAttribute( 'rel' ) ?? '';
				expect( rel ).toContain( 'noopener' );
				expect( rel ).toContain( 'noreferrer' );
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

		it( 'fires the external-clicked event when the preview card is clicked', async () => {
			const user = userEvent.setup();
			const { onClick } = renderWithAnalytics();
			await user.click( screen.getByRole( 'link', { name: /Signing homework/i } ) );
			expect( onClick ).toHaveBeenCalledWith(
				'calypso_reader_atmosphere_timeline_external_clicked',
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
			await user.click( screen.getByRole( 'link', { name: /View publication/i } ) );
			expect( screen.getByText( 'Herve Family' ) ).toBeVisible();
		} );
	} );
} );
