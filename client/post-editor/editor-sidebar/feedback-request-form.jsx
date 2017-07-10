/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';

class FeedbackRequestForm extends PureComponent {
	render() {
		const { translate } = this.props;

		const description = translate(
			'Send your friends a link to read your draft before you publish.'
		);

		return (
			<div className="editor-sidebar__feedback-request-form">
				<p>{ description }</p>
				<label>
					{ translate( 'Friend\'s Email' ) }
					<FormTextInput />
				</label>
				<Button className="editor-sidebar__feedback-request-button">
					{ translate( 'Send to a Friend' ) }
				</Button>
			</div>
		);
	}
}

export default localize( FeedbackRequestForm );
