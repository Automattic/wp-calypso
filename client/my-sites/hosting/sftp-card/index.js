import { FEATURE_SFTP, FEATURE_SSH } from '@automattic/calypso-products';
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
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
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
	requestAtomicSshAccess,
	updateAtomicSftpUser,
	enableAtomicSshAccess,
	disableAtomicSshAccess,
} from 'calypso/state/hosting/actions';
import { getAtomicHostingSftpUsers } from 'calypso/state/selectors/get-atomic-hosting-sftp-users';
import { getAtomicHostingSshAccess } from 'calypso/state/selectors/get-atomic-hosting-ssh-access';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import SshKeys from './ssh-keys';

import './style.scss';

const FILEZILLA_URL = 'https://filezilla-project.org/';
const SFTP_URL = 'sftp.wp.com';
const SFTP_PORT = 22;

export const SftpCard = ( {
	translate,
	username,
	password,
	siteId,
	siteSlug,
	disabled,
	currentUserId,
	requestSftpUsers,
	createSftpUser,
	resetSftpPassword,
	siteHasSftpFeature,
	siteHasSshFeature,
	isSshAccessEnabled,
	requestSshAccess,
	enableSshAccess,
	disableSshAccess,
	removePasswordFromState,
} ) => {
	// State for clipboard copy button for both username and password data
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isPasswordLoading, setPasswordLoading ] = useState( false );
	const [ isSshAccessLoading, setSshAccessLoading ] = useState( false );
	const [ isCopied, setIsCopied ] = useState( {
		password: false,
		url: false,
		port: false,
		username: false,
		sshConnectString: false,
	} );

	const sshConnectString = `ssh ${ username }@sftp.wp.com`;

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
			sshConnectString: false,
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

	const toggleSshAccess = () => {
		setSshAccessLoading( true );
		if ( isSshAccessEnabled ) {
			disableSshAccess( siteId );
		} else {
			enableSshAccess( siteId );
		}
	};

	useEffect( () => {
		if ( ! disabled ) {
			setIsLoading( true );
			requestSftpUsers( siteId );
			if ( siteHasSshFeature ) {
				requestSshAccess( siteId );
			}
		}
		return onDestroy();
	}, [ disabled, siteId, siteHasSshFeature ] );

	useEffect( () => {
		if ( username === null || username || password ) {
			setIsLoading( false );
			setPasswordLoading( false );
		}
	}, [ username, password ] );

	useEffect( () => {
		setSshAccessLoading( false );
	}, [ isSshAccessEnabled ] );

	const renderPasswordField = () => {
		if ( disabled ) {
			return <span></span>;
		}

		if ( password ) {
			return (
				<>
					<div className="sftp-card__copy-field sftp-card__password-field">
						<FormTextInput
							id="password"
							className="sftp-card__copy-input"
							value={ password }
							readOnly
						/>
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
					disabled={ isLoading || isSshAccessLoading }
					checked={ isSshAccessEnabled }
					onChange={ () => toggleSshAccess() }
					label={ translate(
						'Enable SSH access for this site. {{supportLink}}Learn more{{/supportLink}}.',
						{
							components: {
								supportLink: (
									<ExternalLink
										icon
										target="_blank"
										href={ localizeUrl(
											'https://wordpress.com/support/connect-to-ssh-on-wordpress-com/'
										) }
									/>
								),
							},
						}
					) }
				/>
				{ isSshAccessEnabled && (
					<div className="sftp-card__copy-field">
						<FormTextInput className="sftp-card__copy-input" value={ sshConnectString } readOnly />
						<ClipboardButton
							className="sftp-card__copy-button"
							text={ sshConnectString }
							onCopy={ () => onCopy( 'sshConnectString' ) }
							compact
						>
							{ isCopied.sshConnectString && <Gridicon icon="checkmark" /> }
							{ isCopied.sshConnectString
								? translate( 'Copied!' )
								: translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
				) }
			</div>
		);
	};

	const displayQuestionsAndButton = ! ( username || isLoading );
	const showSshPanel = ! siteHasSftpFeature || siteHasSshFeature;

	const featureExplanation = siteHasSshFeature
		? translate(
				"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client. Optionally, enable SSH to perform advanced site operations using the command line."
		  )
		: translate(
				"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client."
		  );

	return (
		<Card className="sftp-card">
			<MaterialIcon icon="key" size={ 32 } />
			<CardHeading>
				{ siteHasSshFeature
					? translate( 'SFTP/SSH credentials' )
					: translate( 'SFTP credentials' ) }
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
					{ showSshPanel && (
						<PanelBody title={ translate( 'What is SSH?' ) } initialOpen={ false }>
							{ translate(
								'SSH stands for Secure Shell. It’s a way to perform advanced operations on your site using the command line. ' +
									'For more information see {{supportLink}}Connect to SSH on WordPress.com{{/supportLink}}.',
								{
									components: {
										supportLink: (
											<ExternalLink
												icon
												target="_blank"
												href={ localizeUrl(
													'https://wordpress.com/support/connect-to-ssh-on-wordpress-com/'
												) }
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
					<FormLabel htmlFor="url">{ translate( 'URL' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput id="url" className="sftp-card__copy-input" value={ SFTP_URL } readOnly />
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
					<FormLabel htmlFor="port">{ translate( 'Port' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput
							id="port"
							className="sftp-card__copy-input"
							value={ SFTP_PORT }
							readOnly
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
					<FormLabel htmlFor="username">{ translate( 'Username' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput
							id="username"
							className="sftp-card__copy-input"
							value={ username }
							readOnly
						/>
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
					<FormLabel htmlFor="password">{ translate( 'Password' ) }</FormLabel>
					{ renderPasswordField() }
					{ siteHasSshFeature && (
						<FormLabel className="sftp-card__ssh-label">{ translate( 'SSH Access' ) }</FormLabel>
					) }
					{ siteHasSshFeature && renderSshField() }
					<ReauthRequired twoStepAuthorization={ twoStepAuthorization }>
						{ () => (
							<>
								{ siteHasSshFeature && isSshAccessEnabled && (
									<SshKeys disabled={ disabled } siteId={ siteId } siteSlug={ siteSlug } />
								) }
							</>
						) }
					</ReauthRequired>
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

const enableSshAccess = ( siteId ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_hosting_configuration_enable_ssh_access' ),
			bumpStat( 'hosting-config', 'enable-ssh-access' )
		),
		enableAtomicSshAccess( siteId )
	);

const disableSshAccess = ( siteId ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_hosting_configuration_disable_ssh_access' ),
			bumpStat( 'hosting-config', 'disable-ssh-access' )
		),
		disableAtomicSshAccess( siteId )
	);

export default connect(
	( state, { disabled } ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
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
			siteSlug,
			currentUserId,
			username,
			password,
			siteHasSftpFeature: siteHasFeature( state, siteId, FEATURE_SFTP ),
			siteHasSshFeature: siteHasFeature( state, siteId, FEATURE_SSH ),
			isSshAccessEnabled: 'ssh' === getAtomicHostingSshAccess( state, siteId ),
		};
	},
	{
		requestSftpUsers: requestAtomicSftpUsers,
		createSftpUser,
		resetSftpPassword,
		requestSshAccess: requestAtomicSshAccess,
		enableSshAccess,
		disableSshAccess,

		removePasswordFromState: ( siteId, username ) =>
			updateAtomicSftpUser( siteId, [ { username, password: null } ] ),
	}
)( localize( SftpCard ) );
