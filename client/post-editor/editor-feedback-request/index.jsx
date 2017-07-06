/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

function EditorFeedbackRequest( { translate, onTrigger } ) {
	return (
		<div className="editor-feedback-request">
			<p className="editor-feedback-request__invitation">
				{ translate(
					'{{highlight}}Need another set of eyes?{{/highlight}} Ask a friend to review your post.',
					{
						components: {
							highlight: <span className="editor-feedback-request__highlight" />
						}
					}
				) }
			</p>
			<Button className="editor-feedback-request__button" onClick={ onTrigger }>
				{ translate( 'Send to a Friend' ) }
			</Button>
		</div>
	);
}

EditorFeedbackRequest.propTypes = {
	translate: PropTypes.func.isRequired,
	onTrigger: PropTypes.func.isRequired
};

EditorFeedbackRequest.defaultProps = {
	translate: identity
};

export default localize( EditorFeedbackRequest );
