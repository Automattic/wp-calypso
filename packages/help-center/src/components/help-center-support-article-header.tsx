import { ExternalLink } from '@automattic/components';

export const SupportArticleHeader = ( {
	post,
	isLoading,
}: {
	post: { link: string; title: string };
	isLoading: boolean;
} ) =>
	isLoading || ! post ? (
		<div className="help-center-article-content__header is-placeholder">
			<h1 className="help-center-article-content__header-title is-placeholder">Post loading…</h1>
		</div>
	) : (
		<div className="help-center-article-content__header">
			<h1 className="help-center-article-content__header-title">
				<ExternalLink
					className="help-center-article-content__header-title-link"
					href={ post.link }
					target="_blank"
					icon={ false }
				>
					{ post.title }
				</ExternalLink>
			</h1>
		</div>
	);
