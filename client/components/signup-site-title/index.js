/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import LoggedOutForm from 'client/components/logged-out-form';
import formState from 'client/lib/form-state';
import FormFieldset from 'client/components/forms/form-fieldset';
import FormButton from 'client/components/forms/form-button';
import FormTextInput from 'client/components/forms/form-text-input';
import { getSiteTitle } from 'client/state/signup/steps/site-title/selectors';
import { translate } from 'i18n-calypso';

class SignupSiteTitle extends React.Component {
	static propTypes = {
		onSubmit: PropTypes.func.isRequired,
		siteTitle: PropTypes.string.isRequired,
	};

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				siteTitle: {
					value: this.props.siteTitle,
				},
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	setFormState = state => {
		this.setState( { form: state } );
	};

	handleChangeEvent = event => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	formFields = () => {
		return (
			<FormFieldset>
				<FormTextInput
					autoFocus={ true }
					autoCapitalize="off"
					className="signup-site-title__input"
					type="text"
					name="siteTitle"
					placeholder={ translate( 'Give your site a title' ) }
					value={ this.state.form.siteTitle.value }
					onChange={ this.handleChangeEvent }
				/>
				<FormButton className="signup-site-title__button">{ translate( 'Continue' ) }</FormButton>
			</FormFieldset>
		);
	};

	handleSubmit = event => {
		event.preventDefault();

		const siteTitle = formState.getFieldValue( this.state.form, 'siteTitle' );
		this.props.onSubmit( siteTitle );
	};

	render() {
		return (
			<LoggedOutForm className="signup-site-title" onSubmit={ this.handleSubmit } noValidate>
				{ this.formFields() }
			</LoggedOutForm>
		);
	}
}

export default connect( state => ( {
	siteTitle: getSiteTitle( state ),
} ) )( SignupSiteTitle );
