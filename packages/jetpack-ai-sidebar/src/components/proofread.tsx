/**
 * Proofread - renderer for the Proofreader (spelling & grammar) flow.
 *
 * Shares the flat item-list behaviour with Generate Feedback (FeedbackList),
 * and adds an "Accept all" action plus a saved-version note in the summary.
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

export interface ProofreadProps {
	summary: string;
	items?: FeedbackListItem[];
	sections?: FeedbackListSection[];
	postId?: EditorPostId;
}

/**
 * Render the proofreader component.
 * @param {ProofreadProps} props Component props.
 * @returns React element.
 */
export default function Proofread( { summary, items, sections, postId }: ProofreadProps ) {
	return (
		<FeedbackList
			summary={ summary }
			items={ items }
			sections={ sections }
			postId={ postId }
			sectionFallbackTitle={ __( 'Spelling & grammar', __i18n_text_domain__ ) }
			rewriteLabel={ __( 'Suggested fix', __i18n_text_domain__ ) }
			staleWarning={ __(
				'Review context changed. Run the spelling and grammar check again for this post.',
				__i18n_text_domain__
			) }
			staleApplyReason={ __( 'Run the check again for this post.', __i18n_text_domain__ ) }
			failureMessage={ __(
				'Could not apply this fix. Check the text and try again.',
				__i18n_text_domain__
			) }
			summaryNotes={ [
				{
					text: __( 'Spelling and grammar check complete.', __i18n_text_domain__ ),
					modifier: 'completed-note',
				},
				{
					text: __( 'Reviews your last saved version.', __i18n_text_domain__ ),
					modifier: 'saved-note',
				},
			] }
			enableBulkApply
		/>
	);
}
