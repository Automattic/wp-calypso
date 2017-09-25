/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import formState from 'lib/form-state';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';

const SignupSiteTitle = React.createClass( {
	propTypes: {
		onSubmit: PropTypes.func.isRequired,
		siteTitle: PropTypes.string.isRequired,
	},

	componentWillMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [ 'siteTitle' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				siteTitle: {
					value: this.props.siteTitle
				}
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	},

	setFormState( state ) {
		this.setState( { form: state } );
	},

	handleChangeEvent( event ) {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	formFields() {
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
	},

	handleSubmit( event ) {
		event.preventDefault();

		const siteTitle = formState.getFieldValue( this.state.form, 'siteTitle' );
		this.props.onSubmit( siteTitle );
	},

	render() {
		return (
			<LoggedOutForm className="signup-site-title" onSubmit={ this.handleSubmit } noValidate>
				{ this.formFields() }
			</LoggedOutForm>
		);
	}
} );

export default connect(
	state => ( {
		siteTitle: getSiteTitle( state ),
	} )
)( SignupSiteTitle );
