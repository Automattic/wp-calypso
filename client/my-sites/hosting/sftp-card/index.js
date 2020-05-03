/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import { Card, Button } from '@automattic/components';
import CardHeading from 'components/card-heading';
import MaterialIcon from 'components/material-icon';
import ClipboardButton from 'components/forms/clipboard-button';
import Spinner from 'components/spinner';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import {
	requestAtomicSftpUsers,
	createAtomicSftpUser,
	resetAtomicSftpPassword,
	updateAtomicSftpUser,
} from 'state/hosting/actions';
import {
	withAnalytics,
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'state/analytics/actions';
import { getAtomicHostingSftpUsers } from 'state/selectors/get-atomic-hosting-sftp-users';
import ExternalLink from 'components/external-link';
import { localizeUrl } from 'lib/i18n-utils';
import FormTextInput from 'components/forms/form-text-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';

/**
 * Style dependencies
 */
import './style.scss';

const FILEZILLA_URL = 'https://filezilla-project.org/';
const SFTP_URL = 'sftp.wp.com';
const SFTP_PORT = 22;

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

	const onDestroy = () => {
		if ( password ) {
			removePasswordFromState( siteId, currentUserId, username );
		}
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
						<ClipboardButton className="sftp-card__copy-button" text={ password } compact>
							{ translate( 'Copy', { context: 'verb' } ) }
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

	const displayQuestionsAndButton = ! ( username || isLoading );

	return (
		<Card className="sftp-card">
			<MaterialIcon icon="cloud" size={ 32 } />
			<CardHeading>{ translate( 'SFTP Credentials' ) }</CardHeading>
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
						: translate(
								"Access and edit your website's files directly by creating SFTP credentials and using an SFTP client."
						  ) }
				</p>
			</div>
			{ displayQuestionsAndButton && (
				<div className="sftp-card__questions">
					<Accordion title={ translate( 'What is SFTP?' ) }>
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
					</Accordion>
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
						{ translate( 'Create SFTP credentials' ) }
					</Button>
				</>
			) }
			{ username && (
				<FormFieldset className="sftp-card__info-field">
					<FormLabel>{ translate( 'URL' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput className="sftp-card__copy-input" value={ SFTP_URL } onChange={ noop } />
						<ClipboardButton className="sftp-card__copy-button" text={ SFTP_URL } compact>
							{ translate( 'Copy', { context: 'verb' } ) }
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
							compact
						>
							{ translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
					<FormLabel>{ translate( 'Username' ) }</FormLabel>
					<div className="sftp-card__copy-field">
						<FormTextInput className="sftp-card__copy-input" value={ username } onChange={ noop } />
						<ClipboardButton className="sftp-card__copy-button" text={ username } compact>
							{ translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</div>
					<FormLabel>{ translate( 'Password' ) }</FormLabel>
					{ renderPasswordField() }
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
