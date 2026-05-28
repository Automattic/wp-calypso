import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useId, useState } from 'react';
import { useSocialAnalytics } from './analytics-context';
import type { SocialEmbedExternal, SocialLongForm } from '../../types';

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

function paragraphsFromText( text: string ): string[] {
	return text
		.split( /\n\s*\n/ )
		.map( ( segment ) => segment.trim() )
		.filter( Boolean );
}

function originalUrl( longForm: SocialLongForm, fallback: string ): string {
	const { path } = longForm.document;
	if ( ! path ) {
		return fallback;
	}
	const base = longForm.publication.url.replace( /\/+$/, '' );
	const suffix = path.startsWith( '/' ) ? path : `/${ path }`;
	return base + suffix;
}

function publicationLabel( longForm: SocialLongForm ): string {
	return (
		longForm.publication.display_name ||
		longForm.publication.name ||
		safeHost( longForm.publication.url )
	);
}

export function PostCardEmbedExternal( {
	embed,
	parentPostUri,
	compact,
}: PostCardEmbedExternalProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const [ expanded, setExpanded ] = useState( false );
	const panelId = useId();

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

	const handleToggleExpanded = () => {
		const next = ! expanded;
		setExpanded( next );
		if ( ! analytics ) {
			return;
		}
		const event = next
			? `calypso_reader_${ analytics.source }_long_form_expanded`
			: `calypso_reader_${ analytics.source }_long_form_collapsed`;
		analytics.onClick( event, {
			connection_id: analytics.connectionId,
			post_uri: parentPostUri,
			external_uri: embed.uri,
		} );
	};

	const handleViewOriginal = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_long_form_original_clicked`, {
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
				<span className="social-post-card-embed-external__description">{ embed.description }</span>
				<span className="social-post-card-embed-external__host">{ safeHost( embed.uri ) }</span>
			</VStack>
		</HStack>
	);

	const card = compact ? (
		<div className="social-post-card-embed-external">{ body }</div>
	) : (
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

	// Skip long-form UI inside quote embeds — competes with the outer card's click target.
	if ( ! embed.long_form || compact ) {
		return card;
	}

	const longForm = embed.long_form;
	const paragraphs = paragraphsFromText( longForm.document.text_content );
	const publication = publicationLabel( longForm );

	const expandLabel = publication
		? translate( 'Read article on %(publication)s', {
				args: { publication },
				comment: 'Button to expand a long-form article shared inline in the Reader.',
		  } )
		: translate( 'Read article' );

	const originalLabel = publication
		? translate( 'View original on %(publication)s', {
				args: { publication },
				comment: 'Link to open a long-form article on the original publication site.',
		  } )
		: translate( 'View original article' );

	// Publication "pill" — avatar + name + `by @handle` + "View
	// publication" link. Mirrors the attribution row Bluesky's own
	// clients show under article cards. Renders whenever any of the
	// pill fields are present; individual cells gracefully omit when
	// their source field is empty.
	const pillName = longForm.publication.display_name || longForm.publication.name;
	const pillHandle = longForm.publication.handle;
	const pillAvatar = longForm.publication.avatar;
	const pillUrl = longForm.publication.url;
	const hasPill = Boolean( pillName || pillHandle || pillAvatar || pillUrl );

	return (
		<>
			{ card }
			<div className="social-post-card-embed-external__long-form">
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
							<a
								className="social-post-card-embed-external__publication-pill-link"
								href={ pillUrl }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ handleViewPublication }
							>
								{ translate( 'View publication' ) }
							</a>
						) }
					</div>
				) }
				<Button
					className="social-post-card-embed-external__long-form-toggle"
					variant="tertiary"
					onClick={ handleToggleExpanded }
					aria-expanded={ expanded }
					aria-controls={ panelId }
				>
					{ expanded ? translate( 'Hide article' ) : expandLabel }
				</Button>
				{ expanded && (
					<article id={ panelId } className="social-post-card-embed-external__long-form-body">
						{ paragraphs.length === 0 ? (
							<p className="social-post-card-embed-external__long-form-empty">
								{ translate( 'No preview text is available for this article.' ) }
							</p>
						) : (
							paragraphs.map( ( paragraph, index ) => (
								// eslint-disable-next-line react/no-array-index-key -- paragraphs derived from a stable single-render text body.
								<p key={ index }>{ paragraph }</p>
							) )
						) }
						<a
							className="social-post-card-embed-external__long-form-original"
							href={ originalUrl( longForm, embed.uri ) }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ handleViewOriginal }
						>
							{ originalLabel }
						</a>
					</article>
				) }
			</div>
		</>
	);
}
