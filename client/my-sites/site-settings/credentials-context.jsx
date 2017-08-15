/**
 * External dependencies
 */
import React from 'react';
import { noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormTextInput from 'components/forms/form-text-input';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextarea from 'components/forms/form-textarea';
import FormLabel from 'components/forms/form-label';
import Gridicon from 'gridicons'
import Button from 'components/button';
import formState from 'lib/form-state';
import { translate } from 'i18n-calypso';
import Notice from 'components/notice';

export default React.createClass( {
	displayName: 'CredentialsContext',

	propTypes: {
		siteId: React.PropTypes.number,
		connectionType: React.PropTypes.oneOf( [
			'ssh',
			'sftp',
			'ftp'
		] ),
		connectionTypeText: React.PropTypes.string,
		connectionTypeDescription: React.PropTypes.string,
		isActiveConnection: React.PropTypes.bool
	},

	componentWillMount: function() {
		const {
			siteId,
			connectionType,
			existingCreds
		} = this.props;

		this.setState( { showPublicKey: false } );

		this.formStateController = new formState.Controller( {
			fieldNames: [
				'serverAddress',
				'serverPort',
				'username',
				'password',
				'publicKey',
				'uploadPath',
			],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				serverAddress: {
					value: existingCreds.host
				},
				serverPort: {
					value: existingCreds.port
				},
				username: {
					value: existingCreds.user
				},
				password: {
					value: existingCreds.pass
				},
				publicKey: {
					value: existingCreds.kpub
				},
				uploadPath: {
					value: existingCreds.upload_path
				},
			}
		} );

		this.setFormState( this.formStateController.getInitialState() );
	},

	setFormState: function( state ) {
		this.setState( { form: state } );
	},

	handleChangeEvent: function( event ) {
		const {
			siteId,
			connectionType
		} = this.props;

		switch ( event.target.name ) {
			case 'serverAddress':
				state.activityLog.rewindStatus[ siteId ].credentials[ connectionType ].credentials.host = event.target.value;
				break;
			case 'serverPort':
				state.activityLog.rewindStatus[ siteId ].credentials[ connectionType ].credentials.port = event.target.value;
				break;
			case 'username':
				state.activityLog.rewindStatus[ siteId ].credentials[ connectionType ].credentials.user = event.target.value;
				break;
			case 'password':
				state.activityLog.rewindStatus[ siteId ].credentials[ connectionType ].credentials.pass = event.target.value;
				break;
			case 'uploadPath':
				state.activityLog.rewindStatus[ siteId ].credentials[ connectionType ].credentials.upload_path = event.target.value;
				break;
		}

		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	},

	getPayload: function() {
		return {
			siteId: this.props.siteId,
			siteUrl: get( state, [ 'sites', 'items', this.props.siteId, 'URL' ], '' ),
			connectionType: this.props.connectionType,
			serverAddress: formState.getFieldValue( this.state.form, 'serverAddress' ),
			serverPort: formState.getFieldValue( this.state.form, 'serverPort' ),
			username: formState.getFieldValue( this.state.form, 'username' ),
			password: formState.getFieldValue( this.state.form, 'password' ),
			uploadPath: formState.getFieldValue( this.state.form, 'uploadPath' )
		};
	},

	togglePublicKey: function() {
		if ( this.state.showPublicKey ) {
			this.setState( { showPublicKey: false } );
		} else {
			this.setState( { showPublicKey: true } );
		}
	},

	saveCredentials: function() {
		const payload = this.getPayload();

		/**
		 * Log the payload to the console until we know what
		 * to do with it
		 */
		console.log( 'Form payload: ', payload );
		this.props.setCredentials( this.props.siteId, payload );
	},

	renderHeader: function() {
		const {
			connectionTypeText,
			connectionTypeDescription,
			isActiveConnection
		} = this.props;

		return (
			<table className="credentials-context">
				<tbody>
					<tr>
						<td className={ isActiveConnection ? 'status-icon green' : 'status-icon gray' }>
							{ isActiveConnection
								? ( <Gridicon icon="checkmark-circle" /> )
								: ( <Gridicon icon="add-outline" /> )
							}
						</td>
						<td>
							<h2>{ connectionTypeText }</h2>
							<h3>{ connectionTypeDescription }</h3>
						</td>
					</tr>
				</tbody>
			</table>
		);
	},

	renderPublicKey: function() {
		const { 
			siteId,
			connectionType
		} = this.props;

		return (
			<FormTextarea 
				onChange={ this.handleChangeEvent } 
				name="publicKey" 
				value={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', connectionType, 'credentials', 'kpub' ], '' ) }
				readOnly
				className="public-key-field"
			/>
		);
	},

	render: function() {
		const {
			siteId,
			connectionType,
			existingCreds,
			isPressable
		} = this.props;

		return (
			<FoldableCard
				clickableHeader
				header={ this.renderHeader() }
			>
				{
					isPressable
					? ( <Notice>This site is hosted by Pressable. SFTP credentials are automatically managed by our partnership.</Notice> )
					: null
				}
				<table>
					<tbody>
						<tr>
							<td className="server-address">
								<FormLabel>{ translate( 'Server Address' ) }</FormLabel>
								<FormTextInput
									onChange={ this.handleChangeEvent }
									name="serverAddress"
									placeholder="yoursite.com"
									value={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', connectionType, 'credentials', 'host' ], '' ) }
									readOnly={ isPressable }
								/>
							</td>
							<td>
								<FormLabel>{ translate( 'Port Number' ) }</FormLabel>
								<FormTextInput
									onChange={ this.handleChangeEvent }
									name="serverPort"
									placeholder="22"
									value={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', connectionType, 'credentials', 'port' ], '' ) }
									readOnly={ isPressable }
								/>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<FormLabel>{ translate( 'Username' ) }</FormLabel>
								<FormTextInput
									onChange={ this.handleChangeEvent }
									name="username"
									placeholder="username"
									value={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', connectionType, 'credentials', 'user' ], '' ) }
									readOnly={ isPressable }
								/>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<FormLabel>{ translate( 'Password' ) }</FormLabel>
								<FormPasswordInput
									onChange={ this.handleChangeEvent }
									name="password"
									placeholder="password"
									value={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', connectionType, 'credentials', 'pass' ], '' ) }
									readOnly={ isPressable }
								/>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<FormLabel>{ translate( 'Upload Path' ) }</FormLabel>
								<FormTextInput
									onChange={ this.handleChangeEvent }
									name="uploadPath"
									placeholder="/var/www/yoursite.com/"
									value={ get( state, [ 'activityLog', 'rewindStatus', siteId, 'credentials', connectionType, 'credentials', 'upload_path' ], '' ) }
									readOnly={ isPressable }
								/>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<FormLabel>{ translate( 'Public Key' ) }</FormLabel>
								<Button onClick={ this.togglePublicKey }>
									{
										this.state.showPublicKey
										? translate( 'Hide Public Key' )
										: translate( 'Show Public Key' )
									}
								</Button>
								{
									this.state.showPublicKey
									? this.renderPublicKey()
									: null
								}
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<Button primary onClick={ this.saveCredentials }>{ translate( 'Save' ) }</Button>
							</td>
						</tr>
					</tbody>
				</table>
			</FoldableCard>
		);
	}
} );
