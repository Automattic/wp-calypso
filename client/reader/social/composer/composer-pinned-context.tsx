import { sanitizePostHtml } from '../components/post-card/sanitize-post-html';
import type { ActiveMode } from './composer-provider';

interface Props {
	mode: ActiveMode | null;
}

export function ComposerPinnedContext( { mode }: Props ) {
	if ( ! mode || mode.kind === 'standalone' ) {
		return null;
	}

	const { previewPost } = mode;

	const authorChip = (
		<div className="social-composer__pinned-author">
			<strong>{ previewPost.author.display_name }</strong>
			<span className="social-composer__pinned-handle">{ `@${ previewPost.author.handle }` }</span>
		</div>
	);

	if ( ! previewPost.html ) {
		return (
			<div className="social-composer__pinned-context">
				{ authorChip }
				<p className="social-composer__pinned-snippet">{ previewPost.text }</p>
			</div>
		);
	}

	// DOMPurify-sanitised via sanitizePostHtml; see sanitize-post-html.ts.
	// The backend already wp_kses-sanitises post.html with the same
	// allow-list, so this is defence-in-depth, not the only line of defence.
	const __html = sanitizePostHtml( previewPost.html );

	return (
		<div className="social-composer__pinned-context">
			{ authorChip }
			<div
				className="social-composer__pinned-snippet"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html } }
			/>
		</div>
	);
}
