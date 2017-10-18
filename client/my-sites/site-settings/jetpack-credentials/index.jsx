/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormTextArea from 'components/forms/form-textarea';
import FormInputValidation from 'components/forms/form-input-validation';
import Popover from 'components/popover';
import Gridicon from 'gridicons';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QueryJetpackCredentials from 'components/data/query-jetpack-credentials';
import { isRewindActive } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getJetpackCredentials,
	credentialsUpdating,
	hasMainCredentials,
	isSitePressable
} from 'state/jetpack/credentials/selectors';
import {
	updateCredentials as updateCredentialsAction,
	autoConfigCredentials as autoConfigCredentialsAction
} from 'state/jetpack/credentials/actions';

class Backups extends Component {
	static propTypes = {
		autoConfigStatus: PropTypes.string,
		credentialsUpdating: PropTypes.bool,
		hasMainCredentials: PropTypes.bool,
		mainCredentials: PropTypes.object,
		isPressable: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		siteId: PropTypes.number.isRequired
	};

	componentWillMount() {
		this.setState( {
			setupStep: 1,
			showPopover: false,
			showPublicKeyField: false,
			form: {
				protocol: 'ssh',
				host: '',
				port: '',
				user: '',
				pass: '',
				abspath: '',
				kpub: ''
			},
			formErrors: {
				host: false,
				port: false,
				user: false,
				pass: false
			}
		} );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.hasMainCredentials !== nextProps.hasMainCredentials ) {
			const initialFormState = {
				protocol: get( nextProps.mainCredentials, 'protocol', 'ssh' ),
				host: get( nextProps.mainCredentials, 'host', '' ),
				port: get( nextProps.mainCredentials, 'port', '' ),
				user: get( nextProps.mainCredentials, 'user', '' ),
				pass: get( nextProps.mainCredentials, 'pass', '' ),
				abspath: get( nextProps.mainCredentials, 'abspath', '' ),
				kpub: get( nextProps.mainCredentials, 'kpub', '' ),
			};

			this.setState( {
				form: initialFormState,
				formErrors: {
					host: false,
					port: false,
					user: false,
					pass: false,
				}
			} );
		}
	}

	handleFieldChange = ( event ) => {
		const formState = get( this.state, 'form', {} );
		const { formErrors } = this.state;

		formState[ event.target.name ] = event.target.value;
		formErrors[ event.target.name ] = false;
		this.setState( {
			form: formState,
			formErrors
		} );
	};

	handleSubmit = () => {
		const {
			siteId,
			updateCredentials,
			translate
		} = this.props;

		const payload = this.getPayload();

		let error = false;
		const errors = this.state.formErrors;

		if ( '' === payload.host ) {
			errors.host = translate( 'Please enter a valid server address.' );
			error = true;
		}

		if ( '' === payload.port ) {
			errors.port = translate( 'Please enter a valid server port.' );
			error = true;
		}

		if ( isNaN( payload.port ) ) {
			errors.port = translate( 'Port number must be numeric.' );
			error = true;
		}

		if ( '' === payload.user ) {
			errors.user = translate( 'Please enter your server username.' );
			error = true;
		}

		if ( '' === payload.pass ) {
			errors.pass = translate( 'Please enter your server password.' );
			error = true;
		}

		if ( error ) {
			this.setState( { formErrors: errors } );
			return;
		}

		updateCredentials( siteId, payload );
	};

	getPayload = () => {
		const payload = this.state.form;
		payload.role = 'main';

		return payload;
	};

	goToNextSetupStep = () => {
		let currentStep = this.state.setupStep;
		currentStep++;
		this.setState( { setupStep: currentStep } );
	};

	loadCredentialsForm = () => {
		this.setState( { setupStep: 3 } );
	};

	resetSetup = () => {
		this.setState( { setupStep: 1 } );
	};

	togglePopover = () => {
		if ( get( this.state, 'showPopover', false ) ) {
			this.setState( { showPopover: false } );
		} else {
			this.setState( { showPopover: true } );
		}
	};

	getProtocolDescription = ( protocol ) => {
		const {
			translate
		} = this.props;

		switch ( protocol ) {
			case 'SSH':
				return translate( 'Secure Shell, the most complete and secure way to access your site.' );
			case 'SFTP':
				return translate( 'Secure File Transfer Protocol, a secure way to access your files.' );
			case 'FTP':
				return translate( 'File Transfer Protocol, a way to access your files.' );
			case 'PRESSABLE-SSH':
				return translate( 'A special Secure Shell connection to Pressable.' );
		}

		return '';
	};

	autoConfigure = () => {
		const {
			autoConfigCredentials,
			siteId
		} = this.props;

		autoConfigCredentials( siteId );
	};

	togglePublicKeyField = () => {
		if ( this.state.showPublicKeyField ) {
			this.setState( { showPublicKeyField: false } );
		} else {
			this.setState( { showPublicKeyField: true } );
		}
	};

	renderHeader() {
		const {
			translate
		} = this.props;

		const connectedFlag = (
			<span className="site-settings__connected">
				<Gridicon icon="checkmark" size={ 18 } />
				{ translate( 'Connected' ) }
			</span>
		);

		return (
			<CompactCard className="site-settings__header">
				<span>{ translate( 'Backups and restores' ) }</span>
				{
					this.props.hasMainCredentials
						? connectedFlag
						: null
				}
			</CompactCard>
		);
	}

	renderFooter() {
		const {
			translate
		} = this.props;

		const {
			setupStep
		} = this.state;

		if ( 4 === setupStep || this.props.hasMainCredentials ) {
			return null;
		}

		return (
			<CompactCard className="site-settings__footer">
				<a
					onClick={ this.togglePopover }
					ref="popoverLink"
				>
					<Gridicon icon="help" size={ 18 } />
					{
						3 === setupStep
							? translate( 'Need help finding your site\'s server credentials?' )
							: translate( 'Why do I need this?' )
					}
				</a>
				<Popover
					context={ this.refs && this.refs.popoverLink }
					isVisible={ get( this.state, 'showPopover', false ) }
					onClose={ this.togglePopover }
					className="site-settings__footer-popover"
					position="top"
				>
					{ translate(
						'These credentials are used to perform automatic actions ' +
						'on your server including backups and restores.'
					) }
				</Popover>
			</CompactCard>
		);
	}

	renderFormFoldable() {
		const {
			mainCredentials,
			translate,
			isPressable
		} = this.props;

		const protocol = get( mainCredentials, 'protocol', 'SSH' ).toUpperCase();
		const description = this.getProtocolDescription( protocol );

		const header = (
			<div>
				<Gridicon icon="checkmark-circle" size={ 48 } className="site-settings__validated" />
				<div>
					<h3>{ protocol }</h3>
					<h4>{ description }</h4>
				</div>
			</div>
		);

		if ( isPressable ) {
			return (
				<CompactCard className="site-settings__pressable-configured">
					<Gridicon icon="checkmark-circle" size={ 48 } />
					<div>
						{ translate( 'You\'re all set! Your credentials have been ' +
							'automatically configured and your site is connected. ' +
							'Backups and restores should run seamlessly.'
						) }
					</div>
				</CompactCard>
			);
		}

		return (
			<FoldableCard
				header={ header }
				className="site-settings__foldable-header"
			>
				{ this.renderForm() }
			</FoldableCard>
		);
	}

	renderForm() {
		const {
			translate
		} = this.props;

		const { showPublicKeyField, formErrors } = this.state;

		return (
			<FormFieldset>
				<table className="site-settings__form-table">
					<tbody>
						<tr>
							<td colSpan="2">
								<FormLabel>
									<div>{ translate( 'Credential Type' ) }</div>
									<FormSelect
										name="protocol"
										value={ get( this.state.form, 'protocol', 'ssh' ) }
										onChange={ this.handleFieldChange }
										disabled={ this.props.credentialsUpdating }
									>
										<option value="ssh">{ translate( 'SSH' ) }</option>
										<option value="sftp">{ translate( 'SFTP' ) }</option>
										<option value="ftp">{ translate( 'FTP' ) }</option>
									</FormSelect>
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td className="site-settings__host-field">
								<FormLabel>
									<div>{ translate( 'Server Address' ) }</div>
									<FormTextInput
										name="host"
										placeholder={ translate( 'yoursite.com' ) }
										value={ get( this.state.form, 'host', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ this.props.credentialsUpdating }
										isError={ !! formErrors.host }
									/>
									{
										formErrors.host
											? <FormInputValidation isError={ true } text={ formErrors.host } />
											: null
									}
								</FormLabel>
							</td>
							<td className="site-settings__port-field">
								<FormLabel>
									<div>{ translate( 'Port Number' ) }</div>
									<FormTextInput
										name="port"
										placeholder={ translate( '22' ) }
										value={ get( this.state.form, 'port', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ this.props.credentialsUpdating }
										isError={ !! formErrors.port }
									/>
									{
										formErrors.port
											? <FormInputValidation isError={ true } text={ formErrors.port } />
											: null
									}
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<FormLabel>
									<div>{ translate( 'Username' ) }</div>
									<FormTextInput
										name="user"
										placeholder={ translate( 'username' ) }
										value={ get( this.state.form, 'user', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ this.props.credentialsUpdating }
										isError={ !! formErrors.user }
									/>
									{
										formErrors.user
											? <FormInputValidation isError={ true } text={ formErrors.user } />
											: null
									}
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<FormLabel>
									<div>{ translate( 'Password' ) }</div>
									<FormTextInput
										name="pass"
										placeholder={ translate( 'password' ) }
										value={ get( this.state.form, 'pass', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ this.props.credentialsUpdating }
										isError={ !! formErrors.pass }
									/>
									{
										formErrors.pass
											? <FormInputValidation isError={ true } text={ formErrors.pass } />
											: null
									}
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<FormLabel>
									<div>{ translate( 'Public Key' ) }</div>
									<Button
										disabled={ this.props.credentialsUpdating }
										onClick={ this.togglePublicKeyField }
									>
										{
											showPublicKeyField
												? translate( 'Hide Public Key' )
												: translate( 'Show Public Key' )
										}

									</Button>
									{
										showPublicKeyField
											? <FormTextArea
												name="kpub"
												value={ get( this.state.form, 'kpub', '' ) }
												onChange={ this.handleFieldChange }
												disabled={ this.props.credentialsUpdating }
											/>
											: null
									}
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								{
									! this.props.hasMainCredentials
										? <Button
											disabled={ this.props.credentialsUpdating }
											onClick={ this.resetSetup }>
												{ translate( 'Cancel' ) }
											</Button>
										: null
								}
								<Button
									primary
									disabled={ this.props.credentialsUpdating }
									onClick={ this.handleSubmit }
								>
									{ translate( 'Save' ) }
								</Button>
							</td>
						</tr>
					</tbody>
				</table>
			</FormFieldset>
		);
	}

	renderSetupStart() {
		const {
			translate
		} = this.props;

		return (
			<CompactCard
				className="site-settings__setup-start"
				onClick={ this.goToNextSetupStep }
			>
				<Gridicon icon="add-outline" size={ 48 } />
				<div>
					<h3>{ translate( 'Add site credentials' ) }</h3>
					<h4>{ translate( 'Used to perform automatic actions on your server including backing up and restoring.' ) }</h4>
				</div>
			</CompactCard>
		);
	}

	renderSetupTos() {
		const {
			isPressable,
			translate
		} = this.props;

		return (
			<CompactCard
				className="site-settings__tos"
				highlight="info"
			>
				<div>
					<Gridicon icon="info" size={ 48 } />
				</div>
				<div>
					{
						isPressable
							? translate( 'WordPress.com can obtain the credentials from your ' +
								'current host which are necessary to perform site backups and ' +
								'restores. Do you want to give WordPress.com access to your ' +
								'host\'s server?' )
							: translate( 'By adding your site credentials, you are giving ' +
								'WordPress.com access to perform automatic actions on your ' +
								'server including backing up your site, restoring your site, ' +
								'as well as manually accessing your site in case of an emergency.' )
					}
				</div>
				{
					isPressable
						? <Button primary onClick={ this.autoConfigure }>{ translate( 'Auto Configure' ) }</Button>
						: <Button primary onClick={ this.loadCredentialsForm }>{ translate( 'Ok, I understand' ) }</Button>
				}
			</CompactCard>
		);
	}

	renderSetupForm() {
		return (
			<CompactCard>
				{ this.renderForm() }
			</CompactCard>
		);
	}

	render() {
		const {
			isPressable,
			isRewindActive,
			autoConfigStatus,
		} = this.props;

		const { setupStep } = this.state;

		const autoConfigIdle = ( 'requesting' === autoConfigStatus || 'waiting' === autoConfigStatus );

		const pressableConfigureFlow = (
			<div>
				{ 1 === setupStep && this.renderSetupStart() }
				{ 2 === setupStep && autoConfigIdle && this.renderSetupTos() }
				{ 'success' === autoConfigStatus && this.renderFormFoldable() }
				{ this.props.hasMainCredentials && this.renderFormFoldable() }
			</div>
		);

		const selfHostedConfigureFlow = (
			<div>
				{ 1 === setupStep && this.renderSetupStart() }
				{ 2 === setupStep && this.renderSetupTos() }
				{ 3 === setupStep && this.renderSetupForm() }
				{ 4 === setupStep && this.renderFormFoldable() }
			</div>
		);

		return (
			<div className="site-settings__backups">
				<QueryRewindStatus siteId={ this.props.siteId } />
				<QueryJetpackCredentials siteId={ this.props.siteId } />
				{ isRewindActive && this.renderHeader() }
				{ isRewindActive && ! this.props.hasMainCredentials && isPressable && pressableConfigureFlow }
				{ isRewindActive && ! this.props.hasMainCredentials && ! isPressable && selfHostedConfigureFlow }
				{ isRewindActive && this.props.hasMainCredentials && this.renderFormFoldable() }
				{ isRewindActive && this.renderFooter() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const credentials = getJetpackCredentials( state, 'main' );

		return {
			autoConfigStatus: state.jetpack.credentials.items.main === undefined ? 'requesting' : 'success',
			credentialsUpdating: credentialsUpdating( state ),
			hasMainCredentials: hasMainCredentials( state ),
			mainCredentials: credentials,
			isPressable: isSitePressable( state, siteId ),
			isRewindActive: isRewindActive( state, siteId ),
			siteId,
		};
	}, {
		autoConfigCredentials: autoConfigCredentialsAction,
		updateCredentials: updateCredentialsAction,
	}
)( localize( Backups ) );
