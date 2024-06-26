import { ExternalLink } from '@automattic/components';

export const SupportArticleHeader = ( {
	post,
	isLoading,
}: {
	post: { link: string; title: string };
	isLoading: boolean;
} ) =>
	isLoading || ! post ? (
		<div className="support-article-dialog__header is-placeholder">
			<h1 className="support-article-dialog__header-title is-placeholder">Post loading…</h1>
		</div>
	) : (
		<div className="support-article-dialog__header">
			<h1 className="support-article-dialog__header-title">
				<ExternalLink
					className="support-article-dialog__header-title-link"
					href={ post.link }
					target="_blank"
					icon={ false }
				>
					{ post.title }
				</ExternalLink>
			</h1>
		</div>
	);
