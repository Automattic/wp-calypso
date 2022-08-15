import config from '@automattic/calypso-config';
import { Card, Button, Gridicon, Spinner } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import ExternalLink from 'calypso/components/external-link';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import MaterialIcon from 'calypso/components/material-icon';
import {
	withAnalytics,
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	requestAtomicSftpUsers,
	createAtomicSftpUser,
	resetAtomicSftpPassword,
	updateAtomicSftpUser,
} from 'calypso/state/hosting/actions';
import { getAtomicHostingSftpUsers } from 'calypso/state/selectors/get-atomic-hosting-sftp-users';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const FILEZILLA_URL = 'https://filezilla-project.org/';
const SFTP_URL = 'sftp.wp.com';
const SFTP_PORT = 22;
const noop = () => {};

export const SftpCard = ( {
	translate,
	username,
	password,
	siteId,
	disabled,
	currentUserId,
	requestSftpUsers,
	createSftpUser,
	resetSftpPassword,
	removePasswordFromState,
} ) => {
	// State for clipboard copy button for both username and password data
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isPasswordLoading, setPasswordLoading ] = useState( false );
	const [ isCopied, setIsCopied ] = useState( {
		password: false,
		url: false,
		port: false,
		username: false,
		sshConnection: false,
	} );
	// TODO replace with live data.
	const [ isSshEnabled, setIsSshEnabled ] = useState( false );

	const isSshAvailable = config.isEnabled( 'launch-wpcom-ssh' );

	// TODO replace with live data.
	const sshConnection = 'ssh site.wordpress.com@sftp.wp.com';

	const onDestroy = () => {
		if ( password ) {
			removePasswordFromState( siteId, currentUserId, username );
		}
	};

	const onCopy = ( field ) => {
		setIsCopied( {
			password: false,
			url: false,
			port: false,
			username: false,
			sshConnection: false,
		} );
		setIsCopied( { [ field ]: true } );
	};

	const resetPassword = () => {
		setPasswordLoading( true );
		resetSftpPassword( siteId, username );
	};

	const createUser = () => {
		setIsLoading( true );
		createSftpUser( siteId, currentUserId );
	};

	useEffect( () => {
		if ( ! disabled ) {
			setIsLoading( true );
			requestSftpUsers( siteId );
		}
		return onDestroy();
	}, [ disabled, siteId ] );

	useEffect( () => {
		if ( username === null || username || password ) {
			setIsLoading( false );
			setPasswordLoading( false );
		}
	}, [ username, password ] );

	const renderPasswordField = () => {
		if ( disabled ) {
			return <span></span>;
		}

		if ( password ) {
			return (
				<>
					<div className="sftp-card__copy-field sftp-card__password-field">
						<FormTextInput className="sftp-card__copy-input" value={ password } onChange={ noop } />
						<ClipboardButton
							className="sftp-card__copy-button"
							text={ password }
							onCopy={ () => onCopy( 'password' ) }
							compact
						>
							{ isCopied.password && <Gridicon icon="checkmark" /> }
							{ isCopied.password
								? translate( 'Copied!' )
								: translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
					<p className="sftp-card__password-warning">
						{ translate(
							'Save your password somewhere safe. You will need to reset it to view it again.'
						) }
					</p>
				</>
			);
		}

		return (
			<>
				<p className="sftp-card__password-explainer">
					{ translate( 'For security reasons, you must reset your password to view it.' ) }
				</p>
				<Button
					onClick={ resetPassword }
					disabled={ isPasswordLoading }
					busy={ isPasswordLoading }
					className="sftp-card__password-reset-button"
				>
					{ translate( 'Reset password' ) }
				</Button>
			</>
		);
	};

	const renderSshField = () => {
		return (
			<div className="sftp-card__ssh-field">
				<ToggleControl
					disabled={ isLoading }
					checked={ isSshEnabled }
					onChange={ () => setIsSshEnabled( ! isSshEnabled ) }
					label={ translate( 'Enable SSH access to this site.' ) }
				/>
				{ isSshEnabled && (
					<div class="sftp-card__copy-field">
						<FormTextInput
							className="sftp-card__copy-input"
							value={ sshConnection }
							onChange={ noop }
						/>
						<ClipboardButton
							className="sftp-card__copy-button"
							text={ sshConnection }
							onCopy={ () => onCopy( 'sshConnection' ) }
							compact
						>
							{ isCopied.sshConnection && <Gridicon icon="checkmark" /> }
							{ isCopied.sshConnection
								? translate( 'Copied!' )
								: translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
				) }
			</div>
		);
	};

	const displayQuestionsAndButton = ! ( username || isLoading );

	const featureExplanation = isSshAvailable
		? translate(
				"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client. Optionally, enable SSH to perform advanced site operations using the command line."
		  )
		: translate(
				"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client."
		  );

	return (
		<Card className="sftp-card">
			<MaterialIcon icon="cloud" size={ 32 } />
			<CardHeading>
				{ isSshAvailable ? translate( 'SFTP/SSH credentials' ) : translate( 'SFTP credentials' ) }
			</CardHeading>
			<div className="sftp-card__body">
				<p>
					{ username
						? translate(
								'Use the credentials below to access and edit your website files using an SFTP client. {{a}}Learn more about SFTP on WordPress.com{{/a}}.',
								{
									components: {
										a: (
											<ExternalLink
												icon
												target="_blank"
												href={ localizeUrl( 'https://wordpress.com/support/sftp/' ) }
											/>
										),
									},
								}
						  )
						: featureExplanation }
				</p>
			</div>
			{ displayQuestionsAndButton && (
				<div className="sftp-card__questions">
					<PanelBody title={ translate( 'What is SFTP?' ) } initialOpen={ false }>
						{ translate(
							'SFTP stands for Secure File Transfer Protocol (or SSH File Transfer Protocol). It’s a secure way for you to access your website files on your local computer via a client program such as {{a}}Filezilla{{/a}}. ' +
								'For more information see {{supportLink}}SFTP on WordPress.com{{/supportLink}}.',
							{
								components: {
									a: <ExternalLink icon target="_blank" href={ FILEZILLA_URL } />,
									supportLink: (
										<ExternalLink
											icon
											target="_blank"
											href={ localizeUrl( 'https://wordpress.com/support/sftp/' ) }
										/>
									),
								},
							}
						) }
					</PanelBody>
					{ isSshAvailable && (
						<PanelBody title={ translate( 'What is SSH?' ) } initialOpen={ false }>
							{ translate(
								'SSH stands for Secure Shell. It’s a way to perform advanced operations on your site using the command line. ' +
									'For more information see {{supportLink}}SFTP on WordPress.com{{/supportLink}}.',
								{
									components: {
										supportLink: (
											<ExternalLink
												icon
												target="_blank"
												href={ localizeUrl( 'https://wordpress.com/support/sftp/' ) }
											/>
										),
									},
								}
							) }
						</PanelBody>
					) }
				</div>
			) }
			{ displayQuestionsAndButton && (
				<>
					<p className="sftp-card__enable-warning">
						{ translate(
							'{{strong}}Ready to access your website files?{{/strong}} Keep in mind, if mistakes happen you can restore your last backup, but will lose changes made after the backup date.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<Button onClick={ createUser } primary className="sftp-card__create-credentials-button">
						{ translate( 'Create credentials' ) }
					</Button>
				</>
			) }
			{ username && (
				<FormFieldset className="sftp-card__info-field">
					<FormLabel>{ translate( 'URL' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput className="sftp-card__copy-input" value={ SFTP_URL } onChange={ noop } />
						<ClipboardButton
							className="sftp-card__copy-button"
							text={ SFTP_URL }
							onCopy={ () => onCopy( 'url' ) }
							compact
						>
							{ isCopied.url && <Gridicon icon="checkmark" /> }
							{ isCopied.url ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
					<FormLabel>{ translate( 'Port' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput
							className="sftp-card__copy-input"
							value={ SFTP_PORT }
							onChange={ noop }
						/>
						<ClipboardButton
							className="sftp-card__copy-button"
							text={ SFTP_PORT.toString() }
							onCopy={ () => onCopy( 'port' ) }
							compact
						>
							{ isCopied.port && <Gridicon icon="checkmark" /> }
							{ isCopied.port ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
					<FormLabel>{ translate( 'Username' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput className="sftp-card__copy-input" value={ username } onChange={ noop } />
						<ClipboardButton
							className="sftp-card__copy-button"
							text={ username }
							onCopy={ () => onCopy( 'username' ) }
							compact
						>
							{ isCopied.username && <Gridicon icon="checkmark" /> }
							{ isCopied.username
								? translate( 'Copied!' )
								: translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
					<FormLabel>{ translate( 'Password' ) }</FormLabel>
					{ renderPasswordField() }
					{ isSshAvailable && (
						<FormLabel className="sftp-card__ssh-label">{ translate( 'SSH Access' ) }</FormLabel>
					) }
					{ isSshAvailable && renderSshField() }
				</FormFieldset>
			) }
			{ isLoading && <Spinner /> }
		</Card>
	);
};

const resetSftpPassword = ( siteId, sshUsername ) =>
	withAnalytics(
		composeAnalytics(
			recordGoogleEvent( 'Hosting Configuration', 'Clicked "Reset Password" Button in SFTP Card' ),
			recordTracksEvent( 'calypso_hosting_configuration_reset_sftp_password' ),
			bumpStat( 'hosting-config', 'reset-sftp-password' )
		),
		resetAtomicSftpPassword( siteId, sshUsername )
	);

const createSftpUser = ( siteId, currentUserId ) =>
	withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Hosting Configuration',
				'Clicked "Create SFTP Credentials" Button in SFTP Card'
			),
			recordTracksEvent( 'calypso_hosting_configuration_create_sftp_user' ),
			bumpStat( 'hosting-config', 'create-sftp-user' )
		),
		createAtomicSftpUser( siteId, currentUserId )
	);

export default connect(
	( state, { disabled } ) => {
		const siteId = getSelectedSiteId( state );
		const currentUserId = getCurrentUserId( state );
		let username;
		let password;

		if ( ! disabled ) {
			const users = getAtomicHostingSftpUsers( state, siteId );
			if ( users !== null ) {
				if ( users.length ) {
					// Pick first user. Rest of users will be handled in next phases.
					username = users[ 0 ].username;
					password = users[ 0 ].password;
				} else {
					// No SFTP user created yet.
					username = null;
					password = null;
				}
			}
		}

		return {
			siteId,
			currentUserId,
			username,
			password,
		};
	},
	{
		requestSftpUsers: requestAtomicSftpUsers,
		createSftpUser,
		resetSftpPassword,
		removePasswordFromState: ( siteId, username ) =>
			updateAtomicSftpUser( siteId, [ { username, password: null } ] ),
	}
)( localize( SftpCard ) );
