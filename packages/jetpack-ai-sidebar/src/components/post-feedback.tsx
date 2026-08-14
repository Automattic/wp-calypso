/**
 * PostFeedback - renderer for the migrated Generate Feedback flow.
 *
 * It keeps the legacy feature's broad "short feedback plus actions" scope,
 * while allowing one-click rewrites when an action has exact source text. The
 * shared item-list behaviour lives in FeedbackList; this wrapper supplies the
 * Generate Feedback copy.
 */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import FeedbackList, {
	type EditorPostId,
	type FeedbackListItem,
	type FeedbackListSection,
} from './feedback-list';
import type { OnResponseAction } from '../utils/response-action';

export interface PostFeedbackProps {
	summary: string;
	items?: FeedbackListItem[];
	sections?: FeedbackListSection[];
	postId?: EditorPostId;
	isMessageStale?: boolean;
	onResponseAction?: OnResponseAction;
}

/** Configures the shared feedback list for generated post feedback. */
export default function PostFeedback( {
	summary,
	items,
	sections,
	postId,
	isMessageStale,
	onResponseAction,
}: PostFeedbackProps ) {
	return (
		<FeedbackList
			componentType="post-feedback"
			summary={ summary }
			items={ items }
			sections={ sections }
			postId={ postId }
			isMessageStale={ isMessageStale }
			onResponseAction={ onResponseAction }
			sectionFallbackTitle={ __( 'Suggested edits', __i18n_text_domain__ ) }
			staleWarning={ __(
				'Feedback context changed. Generate feedback again for this post.',
				__i18n_text_domain__
			) }
			failureMessage={ __(
				'Could not apply this rewrite. Check the text and try again.',
				__i18n_text_domain__
			) }
			enableBulkApply
		/>
	);
}
