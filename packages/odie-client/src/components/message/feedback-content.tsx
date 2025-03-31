import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

interface FeedbackContentProps {
	content?: string;
	meta?: Record< string, string >;
}

export const FeedbackContent = ( { content, meta }: FeedbackContentProps ) => {
	const { __ } = useI18n();
	if ( ! meta?.feedbackUrl ) {
		return null;
	}
	return (
		<>
			<div className="odie-introduction-message-content odie-introduction-message-content__conversation_feedback">
				<p>{ content }</p>
			</div>
			<div className="odie-chatbox-message-sources-container message-feedback-submit">
				<Button className="is-secondary" href={ meta.feedbackUrl } rel="noreferrer" target="_blank">
					{ __( 'Rate conversation', __i18n_text_domain__ ) }
					<Gridicon icon="external" size={ 18 } />
				</Button>
			</div>
		</>
	);
};
