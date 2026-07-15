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

export interface PostFeedbackProps {
	summary: string;
	items?: FeedbackListItem[];
	sections?: FeedbackListSection[];
	postId?: EditorPostId;
}

/**
 * Render the post feedback component.
 * @param {PostFeedbackProps} props Component props.
 * @returns React element.
 */
export default function PostFeedback( { summary, items, sections, postId }: PostFeedbackProps ) {
	return (
		<FeedbackList
			summary={ summary }
			items={ items }
			sections={ sections }
			postId={ postId }
			sectionFallbackTitle={ __( 'Feedback', __i18n_text_domain__ ) }
			rewriteLabel={ __( 'Suggested rewrite', __i18n_text_domain__ ) }
			staleWarning={ __(
				'Feedback context changed. Generate feedback again for this post.',
				__i18n_text_domain__
			) }
			staleApplyReason={ __( 'Generate feedback again for this post.', __i18n_text_domain__ ) }
			failureMessage={ __(
				'Could not apply this rewrite. Check the text and try again.',
				__i18n_text_domain__
			) }
		/>
	);
}
