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
import { getSelectedSiteId } from 'state/ui/selectors';
/* import {
	requestAtomicSFTPDetails,
	resetAtomicSFTPUserPassword,
	createAtomicSFTPUser,
} from 'state/data-getters'; */

// @TODO derive API request details from props when API is merged & remove component state
const SFTPCard = ( { translate, siteId } ) => {
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
	const noSftpUser = get( dummyApiRequest, 'error.status', 0 ) === 404;

	const createAtomicSFTPUser = () => {
		setDummyApiRequest( {
			status: 'success',
			data: {
				username: 'test_user_testsite.wordpress.com_1234',
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
		} );
	};
	// End of dummy API data/methods

	const sftpData = {
		[ translate( 'URL' ) ]: 'sftp1.wordpress.com',
		[ translate( 'Port' ) ]: 22,
		[ translate( 'Username' ) ]: username,
	};

	return (
		<Card>
			<div className="sftp-card__icon-col">
				<MaterialIcon icon="cloud" size={ 32 } />
			</div>
			<div>
				<CardHeading>{ translate( 'SFTP Information' ) }</CardHeading>
				<p>{ translate( "Access and edit your website's files directly using an FTP client." ) }</p>
				{ password && (
					<div className="sftp-card__callout-box">
						<p>{ translate( 'Your new password for your sftp user is:' ) }</p>
						<p>
							<code>{ password }</code>
						</p>
						<strong>
							{ translate(
								'Make sure to save this password in a safe place! You will need to reset this password if you lose it.'
							) }
						</strong>
					</div>
				) }
				{ noSftpUser && (
					<Button onClick={ () => createAtomicSFTPUser( siteId ) } primary>
						Create SFTP User
					</Button>
				) }
				<table
					className={ classNames( 'sftp-card__info-table', {
						[ 'is-placeholder' ]: loading || noSftpUser,
					} ) }
				>
					<tbody>
						{ map( sftpData, ( data, title ) => (
							<tr key={ title }>
								<th>{ title }:</th>
								<td>
									<span>{ ! loading && ! noSftpUser && data }</span>
								</td>
							</tr>
						) ) }
						<tr>
							<th>{ translate( 'Password' ) }:</th>
							<td>
								<Button
									onClick={ () => resetAtomicSFTPUserPassword( siteId ) }
									disabled={ loading || noSftpUser }
									busy={ loading && ! noSftpUser }
								>
									{ translate( 'Reset Password' ) }
								</Button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</Card>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	// @TODO dummy data is added here and in component state; remove when API is merged
	// const sftpDetails = requestAtomicSFTPDetails( siteId );

	// const username = get( sftpDetails, 'data.username', null );
	// const errorCode = get( sftpDetails, 'error.status', null );

	return {
		siteId,
		// username,
		// noSftpUser: errorCode === 404,
		// password: get( sftpDetails, 'data.password', null ),
		// loading: sftpDetails.status === 'pending' || ! username,
	};
} )( localize( SFTPCard ) );
