/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export function EditorFeedbackInvitation( { translate, onTrigger } ) {
	return (
		<div className="editor-feedback-invitation">
			<p className="editor-feedback-invitation__invitation">
				{ translate(
					'{{highlight}}Need another set of eyes?{{/highlight}} Ask a friend to review your post.',
					{
						components: {
							highlight: <span className="editor-feedback-invitation__highlight" />,
						},
					},
				) }
			</p>
			<Button className="editor-feedback-invitation__button" onClick={ onTrigger }>
				{ translate( 'Send to a Friend' ) }
			</Button>
		</div>
	);
}

EditorFeedbackInvitation.propTypes = {
	translate: PropTypes.func.isRequired,
	onTrigger: PropTypes.func.isRequired,
};

export default localize( EditorFeedbackInvitation );
