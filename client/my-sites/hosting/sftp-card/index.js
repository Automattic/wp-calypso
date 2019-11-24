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
	requestAtomicSftpUser,
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
import { getAtomicHostingSftpUser } from 'state/selectors/get-atomic-hosting-sftp-user';

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
	requestSftpUser,
	createSftpUser,
	resetSftpPassword,
	removePasswordFromState,
	sftpUserRequested,
} ) => {
	// State for clipboard copy button for both username and password data
	const [ isCopied, setIsCopied ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
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
		setIsLoading( true );
		resetSftpPassword( siteId, currentUserId );
	};

	const createUser = () => {
		setIsLoading( true );
		createSftpUser( siteId, currentUserId );
	};

	useEffect( () => {
		if ( ! sftpUserRequested && ! disabled ) {
			setIsLoading( true );
			requestSftpUser( siteId, currentUserId );
		}
		return onDestroy();
	}, [ sftpUserRequested ] );

	useEffect( () => {
		if ( username === null || username || password ) {
			setIsLoading( false );
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
				<Button onClick={ resetPassword } disabled={ isLoading } compact>
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
							"{{p}}It's a way for you to access the files and folders on a website via a client program such as {{a}}Filezilla{{/a}} on your local computer.{{/p}}" +
								'{{p}}SFTP stands for Secure File Transfer Protocol (or SSH File Transfer Protocol). It was designed as an extension of the SSH (Secure SHell) protocol. The “secure” part is because it is run over a secure channel, in this case SSH.{{/p}}' +
								'{{p}}SFTP is not to be confused with File Transfer Protocol (FTP) which is similar but not secure. Thanks to the security provided by SFTP you can rest easy knowing that your files and your site are safe and sound.{{/p}}' +
								'{{p}}A variety of custom plugins and themes may ask you to create specific folders or add files via SFTP however, generally speaking, SFTP is not required for your site to function.{{/p}}',
							{
								components: {
									p: <p />,
									a: <a href={ FILEZILLA_URL } />,
								},
							}
						) }
					</Accordion>
					<Accordion title={ translate( 'How to use SFTP to access your site' ) }>
						{ translate(
							'{{p}}Click on "Enable SFTP Credentials". Once you’ve enabled SFTP, you’ll see your SFTP URL, Port Number, Username and Password. Keep these credentials safe!{{/p}}' +
								'{{p}}The username and password are generated by the system automatically. These are unique to your site, so if you have multiple sites, you’ll need to use multiple usernames and passwords, one for each site, in your SFTP Client.{{/p}}' +
								'{{p}}After you’ve created a user and password, you can enter them in an SFTP Client of your choice! If you don’t have a preference, {{a}}Filezilla{{/a}} is a popular and free SFTP client. Clicking the copy button will copy them to your clipboard for ease of use.{{/p}}',
							{
								components: {
									p: <p />,
									a: <a href={ FILEZILLA_URL } />,
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
						{ translate( 'Enable SFTP Credentials' ) }
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

const resetSftpPassword = ( siteId, currentUserId ) =>
	withAnalytics(
		composeAnalytics(
			recordGoogleEvent( 'Hosting Configuration', 'Clicked "Reset Password" Button in SFTP Card' ),
			recordTracksEvent( 'calypso_hosting_configuration_reset_sftp_password' ),
			bumpStat( 'hosting-config', 'reset-sftp-password' )
		),
		resetAtomicSftpPassword( siteId, currentUserId )
	);

const createSftpUser = ( siteId, currentUserId ) =>
	withAnalytics(
		composeAnalytics(
			recordGoogleEvent(
				'Hosting Configuration',
				'Clicked "Enable SFTP Credentials" Button in SFTP Card'
			),
			recordTracksEvent( 'calypso_hosting_configuration_enable_sftp' ),
			bumpStat( 'hosting-config', 'enable-sftp' )
		),
		createAtomicSftpUser( siteId, currentUserId )
	);

export default connect(
	( state, { disabled } ) => {
		const siteId = getSelectedSiteId( state );
		const currentUserId = getCurrentUserId( state );
		let username = null;
		let password = null;
		let sftpUserRequested = null;

		if ( ! disabled ) {
			const sftpDetails = getAtomicHostingSftpUser( state, siteId, currentUserId );
			username = sftpDetails?.username;
			password = sftpDetails?.password;
			sftpUserRequested = sftpDetails !== null;
		}

		return {
			siteId,
			currentUserId,
			username,
			password,
			sftpUserRequested,
		};
	},
	{
		requestSftpUser: requestAtomicSftpUser,
		createSftpUser,
		resetSftpPassword,
		removePasswordFromState: ( siteId, userId, username ) =>
			updateAtomicSftpUser( siteId, userId, { username } ),
	}
)( localize( SftpCard ) );
