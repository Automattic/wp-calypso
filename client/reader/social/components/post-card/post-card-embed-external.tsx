import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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

/**
 * Build the canonical "view on the publication" URL from the verified
 * `standard.site` records. The backend strips trailing slashes from
 * `publication.url` already, but a defensive `replace` keeps the
 * concatenation safe if a future schema change relaxes that.
 */
function originalUrl( longForm: SocialLongForm ): string {
	return longForm.publication.url.replace( /\/+$/, '' ) + longForm.document.path;
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

	// Long-form decoration is suppressed in compact (quote-embed)
	// rendering — the reading view would compete with the outer card's
	// own click target, and inline-reading a quoted long-form post is
	// more nesting than the v1 contract supports.
	if ( ! embed.long_form || compact ) {
		return card;
	}

	const longForm = embed.long_form;
	const paragraphs = paragraphsFromText( longForm.document.text_content );
	const publication = publicationLabel( longForm );

	return (
		<>
			{ card }
			<div className="social-post-card-embed-external__long-form">
				<Button
					className="social-post-card-embed-external__long-form-toggle"
					variant="tertiary"
					onClick={ handleToggleExpanded }
					aria-expanded={ expanded }
				>
					{ expanded
						? translate( 'Hide article' )
						: translate( 'Read article on %(publication)s', {
								args: { publication },
								comment:
									'Button to expand a long-form article from a Bluesky link inline in the Reader.',
						  } ) }
				</Button>
				{ expanded && (
					<article className="social-post-card-embed-external__long-form-body">
						{ paragraphs.length === 0 ? (
							<p className="social-post-card-embed-external__long-form-empty">
								{ translate( 'No preview text is available for this article.' ) }
							</p>
						) : (
							paragraphs.map( ( paragraph, index ) => (
								// eslint-disable-next-line react/no-array-index-key -- paragraphs are derived from a stable text body within a single render; index is a fine key here.
								<p key={ index }>{ paragraph }</p>
							) )
						) }
						<a
							className="social-post-card-embed-external__long-form-original"
							href={ originalUrl( longForm ) }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ handleViewOriginal }
						>
							{ translate( 'View original on %(publication)s', {
								args: { publication },
								comment: 'Link to open a long-form article on the original publication site.',
							} ) }
						</a>
					</article>
				) }
			</div>
		</>
	);
}
