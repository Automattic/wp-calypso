/** @format */
/* eslint-disable */
/**
 * External dependendies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, get, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormTextArea from 'components/forms/form-textarea';
import FormInputValidation from 'components/forms/form-input-validation';
import FormPasswordInput from 'components/forms/form-password-input';
import Gridicon from 'gridicons';
import QueryRewindState from 'components/data/query-rewind-state';
import { deleteCredentials, updateCredentials } from 'state/jetpack/credentials/actions';
import { getSiteSlug } from 'state/sites/selectors';
import { getRewindState, getJetpackCredentialsUpdateStatus } from 'state/selectors';

export class RewindCredentialsForm extends Component {
	static propTypes = {
		role: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		allowCancel: PropTypes.bool,
		allowDelete: PropTypes.bool,
		onCancel: PropTypes.func,
		onComplete: PropTypes.func,
	};

	state = {
		showPrivateKeyField: false,
		form: {
			protocol: 'ssh',
			host: '',
			port: 22,
			user: '',
			pass: '',
			path: '',
			kpri: '',
		},
		formErrors: {
			host: false,
			port: false,
			user: false,
			pass: false,
		},
	};

	handleFieldChange = ( { target: { name, value } } ) => {
		const changedProtocol = 'protocol' === name;
		const defaultPort = 'ftp' === value ? 21 : 22;

		const form = Object.assign(
			this.state.form,
			{ [ name ]: value },
			changedProtocol && { port: defaultPort }
		);

		this.setState( {
			form,
			formErrors: { ...this.state.formErrors, [ name ]: false },
		} );
	};

	handleSubmit = () => {
		const { role, siteId, translate, updateCredentials } = this.props;

		const payload = {
			role,
			...this.state.form,
		};

		let userError = '';

		if ( ! payload.user ) {
			userError = translate( 'Please enter your server username.' );
		} else if ( 'root' === payload.user ) {
			userError = translate(
				"We can't accept credentials for the root user. " +
					'Please provide or create credentials for another user with access to your server.'
			);
		}

		const errors = Object.assign(
			! payload.host && { host: translate( 'Please enter a valid server address.' ) },
			! payload.port && { port: translate( 'Please enter a valid server port.' ) },
			isNaN( payload.port ) && { port: translate( 'Port number must be numeric.' ) },
			userError && { user: userError },
			! payload.pass &&
				! payload.kpri && { pass: translate( 'Please enter your server password.' ) }
		);

		return isEmpty( errors )
			? updateCredentials( siteId, payload )
			: this.setState( { formErrors: errors } );
	};

	handleDelete = () => this.props.deleteCredentials( this.props.siteId, this.props.role );

	toggleAdvancedSettings = () =>
		this.setState( { showAdvancedSettings: ! this.state.showAdvancedSettings } );

	componentWillReceiveProps( nextProps ) {
		const { rewindState, role, siteSlug } = nextProps;
		const credentials = find( rewindState.credentials, { role: role } );

		const nextForm = Object.assign( {}, this.state.form );

		// Populate the fields with data from state if credentials are already saved
		nextForm.protocol = credentials ? credentials.type : nextForm.protocol;
		nextForm.host = isEmpty( nextForm.host ) && credentials ? credentials.host : nextForm.host;
		nextForm.port = isEmpty( nextForm.port ) && credentials ? credentials.port : nextForm.port;
		nextForm.user = isEmpty( nextForm.user ) && credentials ? credentials.user : nextForm.user;
		nextForm.path = isEmpty( nextForm.path ) && credentials ? credentials.path : nextForm.path;

		// Populate the host field with the site slug if needed
		nextForm.host =
			isEmpty( nextForm.host ) && siteSlug ? siteSlug.split( '::' )[ 0 ] : nextForm.host;

		this.setState( { form: nextForm } );
	}

	render() {
		const { formIsSubmitting, onCancel, siteId, translate } = this.props;

		const { showAdvancedSettings, formErrors } = this.state;

		return (
			<div className="rewind-credentials-form">
				<QueryRewindState siteId={ siteId } />
				<FormFieldset>
					<FormLabel htmlFor="protocol-type">{ translate( 'Credential Type' ) }</FormLabel>
					<FormSelect
						name="protocol"
						id="protocol-type"
						value={ get( this.state.form, 'protocol', 'ssh' ) }
						onChange={ this.handleFieldChange }
						disabled={ formIsSubmitting }
					>
						<option value="ssh">{ translate( 'SSH/SFTP' ) }</option>
						<option value="ftp">{ translate( 'FTP' ) }</option>
					</FormSelect>
				</FormFieldset>

				<div className="rewind-credentials-form__row">
					<FormFieldset className="rewind-credentials-form__server-address">
						<FormLabel htmlFor="host-address">{ translate( 'Server Address' ) }</FormLabel>
						<FormTextInput
							name="host"
							id="host-address"
							placeholder={ translate( 'YourGroovyDomain.com' ) }
							value={ get( this.state.form, 'host', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.host }
						/>
						{ formErrors.host && <FormInputValidation isError={ true } text={ formErrors.host } /> }
					</FormFieldset>

					<FormFieldset className="rewind-credentials-form__port-number">
						<FormLabel htmlFor="server-port">{ translate( 'Port Number' ) }</FormLabel>
						<FormTextInput
							name="port"
							id="server-port"
							placeholder="22"
							value={ get( this.state.form, 'port', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.port }
						/>
						{ formErrors.port && <FormInputValidation isError={ true } text={ formErrors.port } /> }
					</FormFieldset>
				</div>

				<div className="rewind-credentials-form__row">
					<FormFieldset className="rewind-credentials-form__username">
						<FormLabel htmlFor="server-username">{ translate( 'Server username' ) }</FormLabel>
						<FormTextInput
							name="user"
							id="server-username"
							placeholder={ translate( 'username' ) }
							value={ get( this.state.form, 'user', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.user }
						/>
						{ formErrors.user && <FormInputValidation isError={ true } text={ formErrors.user } /> }
					</FormFieldset>

					<FormFieldset className="rewind-credentials-form__password">
						<FormLabel htmlFor="server-password">{ translate( 'Server password' ) }</FormLabel>
						<FormPasswordInput
							name="pass"
							id="server-password"
							placeholder={ translate( 'password' ) }
							value={ get( this.state.form, 'pass', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.pass }
						/>
						{ formErrors.pass && <FormInputValidation isError={ true } text={ formErrors.pass } /> }
					</FormFieldset>
				</div>

				<FormFieldset>
					<Button
						disabled={ formIsSubmitting }
						onClick={ this.toggleAdvancedSettings }
						borderless={ true }
						primary={ true }
						className="rewind-credentials-form__advanced-button"
					>
						{ translate( 'Advanced settings' ) }
					</Button>
					{ showAdvancedSettings && (
						<div className="rewind-credentials-form__advanced-settings">
							<FormFieldset className="rewind-credentials-form__path">
								<FormLabel htmlFor="wordpress-path">
									{ translate( 'WordPress installation path' ) }
								</FormLabel>
								<FormTextInput
									name="path"
									id="wordpress-path"
									placeholder="/public_html/wordpress-site/"
									value={ get( this.state.form, 'path', '' ) }
									onChange={ this.handleFieldChange }
									disabled={ formIsSubmitting }
									isError={ !! formErrors.path }
								/>
							</FormFieldset>

							<FormFieldset className="rewind-credentials-form__kpri">
								<FormLabel htmlFor="private-key">{ translate( 'Private Key' ) }</FormLabel>
								<FormTextArea
									name="kpri"
									id="private-key"
									value={ get( this.state.form, 'kpri', '' ) }
									onChange={ this.handleFieldChange }
									disabled={ formIsSubmitting }
									className="rewind-credentials-form__private-key"
								/>
								<p className="form-setting-explanation">
									{ translate( 'Only non-encrypted private keys are supported.' ) }
								</p>
							</FormFieldset>
						</div>
					) }
				</FormFieldset>

				<FormFieldset>
					<Button primary disabled={ formIsSubmitting } onClick={ this.handleSubmit }>
						{ translate( 'Save' ) }
					</Button>
					{ this.props.allowCancel && (
						<Button
							disabled={ formIsSubmitting }
							onClick={ onCancel }
							className="rewind-credentials-form__cancel-button"
						>
							{ translate( 'Cancel' ) }
						</Button>
					) }
					{ this.props.allowDelete && (
						<Button
							borderless={ true }
							disabled={ formIsSubmitting }
							onClick={ this.handleDelete }
							className="rewind-credentials-form__delete-button"
						>
							<Gridicon icon="trash" size={ 18 } />
							{ translate( 'Delete' ) }
						</Button>
					) }
				</FormFieldset>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	formIsSubmitting: 'pending' === getJetpackCredentialsUpdateStatus( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	rewindState: getRewindState( state, siteId ),
} );

export default connect( mapStateToProps, { deleteCredentials, updateCredentials } )(
	localize( RewindCredentialsForm )
);
