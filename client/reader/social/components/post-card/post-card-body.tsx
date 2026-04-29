import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { sanitizePostHtml } from './sanitize-post-html';
import type { SocialPost } from '../../types';

interface PostCardBodyProps {
	post: SocialPost;
}

export function PostCardBody( { post }: PostCardBodyProps ) {
	const translate = useTranslate();
	const [ revealed, setRevealed ] = useState( false );

	const renderBody = () => {
		if ( ! post.html ) {
			return <p className="social-post-card-body">{ post.text }</p>;
		}
		// DOMPurify-sanitised via sanitizePostHtml; see sanitize-post-html.ts.
		// The backend already wp_kses-sanitises post.html with the same
		// allow-list, so this is defence-in-depth, not the only line of defence.
		const __html = sanitizePostHtml( post.html );
		return (
			<div
				className="social-post-card-body"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html } }
			/>
		);
	};

	const cw = post.content_warning;
	if ( cw && cw.sensitive && ! revealed ) {
		const label = cw.spoiler_text
			? translate( 'Show content: %(reason)s', { args: { reason: cw.spoiler_text } } )
			: translate( 'Show sensitive content' );
		return (
			<div className="social-post-card-body social-post-card-body--gated">
				{ cw.spoiler_text && <p className="social-post-card-body__spoiler">{ cw.spoiler_text }</p> }
				<Button
					variant="secondary"
					onClick={ ( e: React.MouseEvent ) => {
						// Prevent the card-link overlay from intercepting and navigating away.
						e.preventDefault();
						e.stopPropagation();
						setRevealed( true );
					} }
				>
					{ label }
				</Button>
			</div>
		);
	}

	return renderBody();
}
