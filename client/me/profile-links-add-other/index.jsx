/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';
import { recordGoogleEvent } from 'state/analytics/actions';

class ProfileLinksAddOther extends React.Component {
	state = {
		title: '',
		value: '',
		lastError: false,
	};

	// As the user types, the component state changes thanks to the LinkedStateMixin.
	// This function, called in render, validates their input on each state change
	// and is used to decide whether or not to enable the Add Site button
	getFormDisabled() {
		const trimmedValue = this.state.value.trim();

		if ( ! this.state.title.trim() || ! trimmedValue ) {
			return true;
		}

		// Disallow spaces in the trimmed URL value
		if ( -1 !== trimmedValue.indexOf( ' ' ) ) {
			return true;
		}

		// Minimalist domain regex.  Not meant to be bulletproof.
		// Requires at least one letter or number, then one dot, then
		// at least two letters
		if ( ! trimmedValue.match( /[a-zA-z0-9]+\.[a-zA-z]{2,}/ ) ) {
			return true;
		}

		// Scheme regex.  If a scheme is provided, it must be http or https
		if ( trimmedValue.match( /^.*:\/\// ) && ! trimmedValue.match( /^https?:\/\// ) ) {
			return true;
		}

		return false;
	}

	recordClickEvent = action => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	getClickHandler = action => {
		return () => this.recordClickEvent( action );
	};

	getFocusHandler = action => {
		return () => this.props.recordGoogleEvent( 'Me', 'Focused on ' + action );
	};

	handleCancelButtonClick = event => {
		event.preventDefault();
		this.recordClickEvent( 'Cancel Other Site Button' );
		this.props.onCancel();
	};

	handleChange = e => {
		const { name, value } = e.currentTarget;
		this.setState( { [ name ]: value } );
	};

	onSubmit = event => {
		event.preventDefault();

		// When the form's submit button is disabled, the form's onSubmit does not
		// get fired for ENTER presses in input text fields, so this check
		// for getFormDisabled is merely here out of an abundance of caution
		if ( this.getFormDisabled() ) {
			return;
		}

		this.props.userProfileLinks.addProfileLinks(
			[
				{
					title: this.state.title.trim(),
					value: this.state.value.trim(),
				},
			],
			this.onSubmitResponse
		);
	};

	onSubmitResponse = ( error, data ) => {
		if ( error ) {
			this.setState( {
				lastError: this.props.translate( 'Unable to add link right now. Please try again later.' ),
			} );
		} else if ( data.duplicate ) {
			this.setState( {
				lastError: this.props.translate(
					'That link is already in your profile links. No changes were made.'
				),
			} );
		} else if ( data.malformed ) {
			this.setState( {
				lastError: this.props.translate( 'An unexpected error occurred. Please try again later.' ),
			} );
		} else {
			this.props.onSuccess();
		}
	};

	clearLastError = () => {
		this.setState( {
			lastError: false,
		} );
	};

	possiblyRenderError() {
		if ( ! this.state.lastError ) {
			return null;
		}

		return (
			<Notice
				className="profile-links-add-other__error"
				status="is-error"
				onDismissClick={ this.clearLastError }
				text={ this.state.lastError }
			/>
		);
	}

	render() {
		return (
			<form className="profile-links-add-other" onSubmit={ this.onSubmit }>
				<p>
					{ this.props.translate(
						'Please enter the URL and description of the site you want to add to your profile.'
					) }
				</p>
				{ this.possiblyRenderError() }
				<FormFieldset>
					<FormTextInput
						className="profile-links-add-other__value"
						placeholder={ this.props.translate( 'Enter a URL' ) }
						onFocus={ this.getFocusHandler( 'Add Other Site URL Field' ) }
						name="value"
						value={ this.state.value }
						onChange={ this.handleChange }
					/>
					<FormTextInput
						className="profile-links-add-other__title"
						placeholder={ this.props.translate( 'Enter a description' ) }
						onFocus={ this.getFocusHandler( 'Add Other Site Description Field' ) }
						name="title"
						value={ this.state.title }
						onChange={ this.handleChange }
					/>
					<FormButton
						className="profile-links-add-other__add"
						disabled={ this.getFormDisabled() }
						onClick={ this.getClickHandler( 'Save Other Site Button' ) }
					>
						{ this.props.translate( 'Add Site' ) }
					</FormButton>
					<FormButton
						className="profile-links-add-other__cancel"
						isPrimary={ false }
						onClick={ this.handleCancelButtonClick }
					>
						{ this.props.translate( 'Cancel' ) }
					</FormButton>
				</FormFieldset>
			</form>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( localize( ProfileLinksAddOther ) );
