/** @format */

/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, map } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
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
import { getAtomicHostingSftpUser } from 'state/selectors/get-atomic-hosting-sftp-user';

const SftpCard = ( {
	translate,
	username,
	password,
	siteId,
	loaded,
	disabled,
	currentUserId,
	requestSftpUser,
	createSftpUser,
	resetSftpPassword,
	removePasswordFromState,
} ) => {
	// State for clipboard copy button for both username and password data
	const [ isCopied, setIsCopied ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const usernameIsCopied = isCopied === 'username';
	const passwordIsCopied = isCopied === 'password';

	const onDestroy = () => {
		if ( password ) {
			removePasswordFromState( siteId, currentUserId, { username } );
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
		if ( ! loaded ) {
			setIsLoading( true );
			requestSftpUser( siteId, currentUserId );
		}
		return onDestroy();
	}, [ loaded ] );

	useEffect( () => {
		if ( username === null || username || password ) {
			setIsLoading( false );
		}
	}, [ username, password ] );

	const sftpData = {
		[ translate( 'URL' ) ]: 'sftp.wp.com',
		[ translate( 'Port' ) ]: 22,
	};

	const renderPasswordCell = () => {
		if ( disabled ) {
			return <span></span>;
		}

		if ( password ) {
			return (
				<>
					<p className="sftp-card__hidden-overflow">{ password }</p>
					<ClipboardButton text={ password } onCopy={ () => setIsCopied( 'password' ) } compact>
						{ passwordIsCopied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
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
				<p>{ translate( 'You must reset your password to view it.' ) }</p>
				<Button onClick={ resetPassword } disabled={ isLoading } compact>
					{ translate( 'Reset Password' ) }
				</Button>
			</>
		);
	};

	return (
		<Card className="sftp-card">
			<div className="sftp-card__icon">
				<MaterialIcon icon="cloud" size={ 32 } />
			</div>
			<div className="sftp-card__body">
				<CardHeading>{ translate( 'SFTP Information' ) }</CardHeading>
				{ disabled || username || isLoading ? (
					<p>
						{ translate( "Access and edit your website's files directly using an FTP client." ) }
					</p>
				) : (
					<>
						<p>
							{ translate(
								"Enable SFTP access to generate a username and password so you can access your website's files."
							) }
						</p>
						<Button onClick={ createUser } primary>
							{ translate( 'Enable SFTP' ) }
						</Button>
					</>
				) }
			</div>
			{ ( username || disabled ) && (
				<table
					className={ classNames( 'sftp-card__info-table', { [ 'is-placeholder' ]: disabled } ) }
				>
					<tbody>
						{ map( sftpData, ( data, title ) => (
							<tr key={ title }>
								<th>{ title }:</th>
								<td>
									<span>{ ! disabled && data }</span>
								</td>
							</tr>
						) ) }
						<tr>
							<th>{ translate( 'Username' ) }:</th>
							<td>
								{ disabled ? (
									<span></span>
								) : (
									<>
										<p className="sftp-card__hidden-overflow">{ username }</p>
										<ClipboardButton
											text={ username }
											onCopy={ () => setIsCopied( 'username' ) }
											compact
										>
											{ usernameIsCopied
												? translate( 'Copied!' )
												: translate( 'Copy', { context: 'verb' } ) }
										</ClipboardButton>
									</>
								) }
							</td>
						</tr>
						<tr>
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

export default connect(
	( state, { disabled } ) => {
		const siteId = getSelectedSiteId( state );
		const currentUserId = getCurrentUserId( state );
		let username = null;
		let password = null;
		let loaded = null;

		if ( ! disabled ) {
			const sftpDetails = getAtomicHostingSftpUser( state, siteId, currentUserId );
			username = get( sftpDetails, 'username' );
			password = get( sftpDetails, 'password' );
			loaded = sftpDetails !== null;
		}

		return {
			siteId,
			currentUserId,
			username,
			password,
			loaded,
		};
	},
	{
		requestSftpUser: requestAtomicSftpUser,
		createSftpUser: createAtomicSftpUser,
		resetSftpPassword: resetAtomicSftpPassword,
		removePasswordFromState: updateAtomicSftpUser,
	}
)( localize( SftpCard ) );
