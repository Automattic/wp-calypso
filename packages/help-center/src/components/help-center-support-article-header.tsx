import { ExternalLink } from '@automattic/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import type { PostObject } from '../types';

export const SupportArticleHeader = ( {
	post,
	isLoading,
}: {
	post: PostObject;
	isLoading: boolean;
} ) =>
	isLoading || ! post ? (
		<div className="help-center-article-content__header is-placeholder">
			<h1 className="help-center-article-content__header-title is-placeholder">Post loading…</h1>
		</div>
	) : (
		<div className="help-center-article-content__header">
			<ExternalLink
				className="help-center-article-content__header-link"
				href={ post.URL }
				target="_blank"
				icon
			>
				{ __( 'Open support page', __i18n_text_domain__ ) }
			</ExternalLink>
			<h1 className="help-center-article-content__header-title">
				{ decodeEntities( post.title ) }
			</h1>
		</div>
	);
