import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSocialAnalytics } from './analytics-context';
import type { SocialEmbedExternal } from '../../types';

interface PostCardEmbedExternalProps {
	embed: SocialEmbedExternal;
	parentPostUri: string;
	compact?: boolean;
}

function safeHost( uri: string ): string {
	try {
		return new URL( uri ).host;
	} catch {
		return '';
	}
}

export function PostCardEmbedExternal( {
	embed,
	parentPostUri,
	compact,
}: PostCardEmbedExternalProps ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const analytics = useSocialAnalytics();

	const handleClick = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_external_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: parentPostUri,
			external_uri: embed.uri,
		} );
	};

	const handleViewPublication = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_long_form_publication_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: parentPostUri,
			external_uri: embed.uri,
		} );
	};

	// Long-form decoration is suppressed inside quote embeds (`compact`):
	// the richer preview card would compete with the surrounding quote chrome.
	const longForm = compact ? undefined : embed.long_form;

	// Plain external link (or a long-form post rendered inside a quote embed):
	// the slim thumbnail + title / description / host card.
	if ( ! longForm ) {
		const body = (
			<HStack alignment="flex-start" spacing={ 3 } justify="flex-start">
				{ embed.thumb && (
					<img
						className="social-post-card-embed-external__thumb"
						src={ embed.thumb }
						alt=""
						loading="lazy"
					/>
				) }
				<VStack spacing={ 1 }>
					<span className="social-post-card-embed-external__title">{ embed.title }</span>
					<span className="social-post-card-embed-external__description">
						{ embed.description }
					</span>
					<span className="social-post-card-embed-external__host">{ safeHost( embed.uri ) }</span>
				</VStack>
			</HStack>
		);

		if ( compact ) {
			return <div className="social-post-card-embed-external">{ body }</div>;
		}

		return (
			<a
				className="social-post-card-embed-external"
				href={ embed.uri }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ handleClick }
			>
				{ body }
			</a>
		);
	}

	// Long-form preview card — a richer article card mirroring the
	// standard.site cards Bluesky's own clients render: optional cover image
	// on top, then title / description, then a published-date · reading-time
	// meta line. The whole card links to the canonical article URL.
	const { document: doc, publication } = longForm;
	const publishedDate = doc.published_at ? moment( doc.published_at ).format( 'LL' ) : '';
	const readingTime =
		doc.reading_time !== null
			? translate( '%(minutes)dm', {
					args: { minutes: doc.reading_time },
					comment:
						'Estimated reading time for a long-form article, in minutes (e.g. "6m"). Shown next to the publication date.',
			  } )
			: '';
	const metaLine = [ publishedDate, readingTime ].filter( Boolean ).join( ' · ' );

	// Publication "pill" — avatar + name + `by @handle` + "View publication"
	// link. Mirrors the attribution row Bluesky's own clients show under
	// article cards. Renders whenever any of the pill fields are present;
	// individual cells gracefully omit when their source field is empty.
	const pillName = publication.display_name || publication.name;
	const pillHandle = publication.handle;
	const pillAvatar = publication.avatar;
	const pillUrl = publication.url;
	const hasPill = Boolean( pillName || pillHandle || pillAvatar || pillUrl );

	return (
		<>
			<a
				className="social-post-card-embed-external"
				href={ embed.uri }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ handleClick }
			>
				{ doc.cover_image && (
					<img
						className="social-post-card-embed-external__cover"
						src={ doc.cover_image }
						alt=""
						loading="lazy"
					/>
				) }
				<VStack spacing={ 1 } className="social-post-card-embed-external__content">
					<span className="social-post-card-embed-external__title">
						{ doc.title || embed.title }
					</span>
					<span className="social-post-card-embed-external__description">
						{ doc.description || embed.description }
					</span>
					{ metaLine && (
						<span className="social-post-card-embed-external__meta">{ metaLine }</span>
					) }
				</VStack>
			</a>
			{ hasPill && (
				<div className="social-post-card-embed-external__publication-pill">
					{ pillAvatar && (
						<img
							className="social-post-card-embed-external__publication-pill-avatar"
							src={ pillAvatar }
							alt=""
							loading="lazy"
							width={ 24 }
							height={ 24 }
						/>
					) }
					<div className="social-post-card-embed-external__publication-pill-text">
						{ pillName && (
							<span className="social-post-card-embed-external__publication-pill-name">
								{ pillName }
							</span>
						) }
						{ pillHandle && (
							<span className="social-post-card-embed-external__publication-pill-handle">
								{ translate( 'by @%(handle)s', {
									args: { handle: pillHandle },
									comment:
										"Attribution under a long-form article card. %(handle)s is the publisher's social-network handle.",
								} ) }
							</span>
						) }
					</div>
					{ pillUrl && (
						<ExternalLink
							className="social-post-card-embed-external__publication-pill-link"
							href={ pillUrl }
							// ExternalLink adds `external noopener`; keep `noreferrer` too.
							rel="noreferrer"
							onClick={ handleViewPublication }
						>
							{ translate( 'View publication' ) }
						</ExternalLink>
					) }
				</div>
			) }
		</>
	);
}
