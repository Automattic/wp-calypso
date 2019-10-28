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

// @TODO derive API request details from props when API is merged & remove component state for dummy data
const SFTPCard = ( { translate, siteId, disabled } ) => {
	// State for clipboard copy button for both username and password data
	const [ isCopied, setIsCopied ] = useState( false );
	const usernameIsCopied = isCopied === 'username';
	const passwordIsCopied = isCopied === 'password';

	// Begin dummy API data/methods
	const [ dummyApiRequest, setDummyApiRequest ] = useState( {
		status: 'error',
		error: {
			status: 404,
		},
	} );

	const username = get( dummyApiRequest, 'data.username', null );
	const password = get( dummyApiRequest, 'data.password', null );
	const loading = dummyApiRequest.status === 'pending';
	const noSftpUser = dummyApiRequest.error.status === 404;

	const createAtomicSFTPUser = () => {
		setDummyApiRequest( {
			status: 'success',
			data: {
				username: 'test_user_testsite.wordpress.com_1234',
			},
			error: {
				status: 0,
			},
		} );
	};

	const resetAtomicSFTPUserPassword = () => {
		setDummyApiRequest( {
			status: 'success',
			data: {
				username: 'test_user_testsite.wordpress.com_1234',
				password: 'a.reset.p.a.s.s.word',
			},
			error: {
				status: 0,
			},
		} );
	};
	// End of dummy API data/methods

	const sftpData = {
		[ translate( 'URL' ) ]: 'sftp1.wordpress.com',
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
				{ ! disabled && noSftpUser ? (
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
				) : (
					<p>
						{ translate( "Access and edit your website's files directly using an FTP client." ) }
					</p>
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
			{ loading && ! noSftpUser && <Spinner /> }
		</Card>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
	};
} )( localize( SFTPCard ) );
