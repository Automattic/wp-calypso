/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import MaterialIcon from 'components/material-icon';
import Button from 'components/button';
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

/**
 * Style dependencies
 */
import './style.scss';

const FILEZILLA_URL = 'https://filezilla-project.org/';
const SFTP_URL = 'sftp.wp.com';
const SFTP_PORT = 22;

const SftpCard = ( {
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
	const [ isCopied, setIsCopied ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isPasswordLoading, setPasswordLoading ] = useState( false );
	const usernameIsCopied = isCopied === 'username';
	const passwordIsCopied = isCopied === 'password';
	const urlIsCopied = isCopied === 'url';
	const portIsCopied = isCopied === 'port';

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
		setIsLoading( true );
		requestSftpUsers( siteId );
		return onDestroy();
	}, [ siteId ] );

	useEffect( () => {
		if ( username === null || username || password ) {
			setIsLoading( false );
			setPasswordLoading( false );
		}
	}, [ username, password ] );

	const renderPasswordCell = () => {
		if ( disabled ) {
			return <span></span>;
		}

		if ( password ) {
			return (
				<>
					<span className="sftp-card__hidden-overflow">{ password }</span>
					<ClipboardButton text={ password } onCopy={ () => setIsCopied( 'password' ) } compact>
						{ passwordIsCopied ? translate( 'Copied!' ) : translate( 'Copy password' ) }
					</ClipboardButton>
					<p className="sftp-card__password-warning">
						{ translate(
							"Be sure to save your password somewhere safe. You won't be able to view it again without resetting."
						) }
					</p>
				</>
			);
		}

		return (
			<>
				<span>{ translate( 'You must reset your password to view it.' ) }</span>
				<Button
					onClick={ resetPassword }
					disabled={ isPasswordLoading }
					busy={ isPasswordLoading }
					compact
				>
					{ translate( 'Reset Password' ) }
				</Button>
			</>
		);
	};

	const displayQuestionsAndButton = ! ( disabled || username || isLoading );

	return (
		<Card className="sftp-card">
			<MaterialIcon icon="cloud" size={ 32 } />
			<CardHeading>{ translate( 'SFTP Credentials' ) }</CardHeading>
			<div className="sftp-card__body">
				<p>
					{ translate( "Access and edit your website's files directly by using an SFTP client." ) }
				</p>
			</div>
			{ displayQuestionsAndButton && (
				<div className="sftp-card__questions">
					<Accordion title={ translate( 'What is SFTP?' ) }>
						{ translate(
							"It's a way for you to access the files and folders on a website via a client program such as {{a}}Filezilla{{/a}} on your local computer. " +
								'For more information see {{supportLink}}SFTP and WordPress.com{{/supportLink}} ',
							{
								components: {
									a: <ExternalLink icon target="_blank" href={ FILEZILLA_URL } />,
									supportLink: (
										<ExternalLink
											icon
											target="_blank"
											href={ localizeUrl( 'https://en.support.wordpress.com/sftp/' ) }
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
					<Button onClick={ createUser } primary>
						{ translate( 'Create SFTP Credentials' ) }
					</Button>
				</>
			) }
			{ ( username || disabled ) && (
				<table
					className={ classNames( 'sftp-card__info-table', { [ 'is-placeholder' ]: disabled } ) }
				>
					<tbody>
						<tr key={ translate( 'URL' ) }>
							<th>{ translate( 'URL' ) }:</th>
							<td>
								<>
									<span>{ ! disabled && SFTP_URL }</span>
									<ClipboardButton text={ SFTP_URL } onCopy={ () => setIsCopied( 'url' ) } compact>
										{ urlIsCopied ? translate( 'Copied!' ) : translate( 'Copy URL' ) }
									</ClipboardButton>
								</>
							</td>
						</tr>
						<tr key={ translate( 'Port' ) }>
							<th>{ translate( 'Port' ) }:</th>
							<td>
								<>
									<span>{ ! disabled && SFTP_PORT }</span>
									<ClipboardButton
										text={ SFTP_PORT.toString() }
										onCopy={ () => setIsCopied( 'port' ) }
										compact
									>
										{ portIsCopied ? translate( 'Copied!' ) : translate( 'Copy Port' ) }
									</ClipboardButton>
								</>
							</td>
						</tr>
						<tr className={ classNames( { 'has-action': ! disabled } ) }>
							<th>{ translate( 'Username' ) }:</th>
							<td>
								{ disabled ? (
									<span></span>
								) : (
									<>
										<span className="sftp-card__hidden-overflow">{ username }</span>
										<ClipboardButton
											text={ username }
											onCopy={ () => setIsCopied( 'username' ) }
											compact
										>
											{ usernameIsCopied ? translate( 'Copied!' ) : translate( 'Copy username' ) }
										</ClipboardButton>
									</>
								) }
							</td>
						</tr>
						<tr className={ classNames( { 'has-action': ! disabled } ) }>
							<th>{ translate( 'Password' ) }:</th>
							<td>{ renderPasswordCell() }</td>
						</tr>
					</tbody>
				</table>
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
