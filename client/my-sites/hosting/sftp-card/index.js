/** @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
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
import {
	requestAtomicSFTPDetails,
	resetAtomicSFTPUserPassword,
	createAtomicSFTPUser,
} from 'state/data-getters';

const SFTPCard = ( { translate, username, password, siteId, loading, disabled } ) => {
	// State for clipboard copy button for both username and password data
	const [ isCopied, setIsCopied ] = useState( false );
	const usernameIsCopied = isCopied === 'username';
	const passwordIsCopied = isCopied === 'password';

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
				<Button
					onClick={ () => resetAtomicSFTPUserPassword( siteId ) }
					disabled={ loading }
					compact
				>
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
				{ disabled || username || loading ? (
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
						<Button onClick={ () => createAtomicSFTPUser( siteId ) } primary>
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
			{ loading && <Spinner /> }
		</Card>
	);
};

export default connect( ( state, { disabled } ) => {
	const siteId = getSelectedSiteId( state );
	let username = null;
	let password = null;
	let loading = null;

	if ( ! disabled ) {
		const sftpDetails = requestAtomicSFTPDetails( siteId );
		username = get( sftpDetails, 'data.username' );
		password = get( sftpDetails, 'data.password' );
		loading = sftpDetails.state === 'pending';
	}

	return {
		siteId,
		username,
		password,
		loading,
	};
} )( localize( SFTPCard ) );
