/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';

export class FeedbackRequestForm extends PureComponent {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		requestFeedback: PropTypes.func.isRequired,
	};

	state = { inputValue: '' };

	updateInputValue = event =>
		this.setState( {
			inputValue: event.target.value,
		} );

	onSubmit = event => {
		event.preventDefault();
		this.props.requestFeedback( this.state.inputValue );
		this.setState( { inputValue: '' } );
	};

	render() {
		const { translate } = this.props;

		const description = translate(
			'Send your friends a link to read your draft before you publish.',
		);

		return (
			<form className="editor-sidebar__feedback-request-form" onSubmit={ this.onSubmit }>
				<p>
					{ description }
				</p>
				<label>
					<span className="editor-sidebar__feedback-request-input-label">
						{ translate( "Friend's Email" ) }
					</span>
					<FormTextInput
						className="editor-sidebar__feedback-request-input"
						onChange={ this.updateInputValue }
						placeholder="name@domain.com"
						value={ this.state.inputValue }
					/>
				</label>
				<Button type="submit" className="editor-sidebar__feedback-request-button">
					{ translate( 'Send to a Friend' ) }
				</Button>
			</form>
		);
	}
}

export default localize( FeedbackRequestForm );
