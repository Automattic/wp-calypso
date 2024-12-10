import { ExternalLink } from '@automattic/components';
import { decodeEntities } from '@wordpress/html-entities';
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
				Open support page
			</ExternalLink>
			<h1 className="help-center-article-content__header-title">
				{ decodeEntities( post.title ) }
			</h1>
		</div>
	);
