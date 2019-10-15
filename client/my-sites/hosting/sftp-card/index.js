/** @format */

/**
 * External dependencies
 */
import React from 'react';
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
import {
	requestAtomicSFTPDetails,
	resetAtomicSFTPUserPassword,
	createAtomicSFTPUser,
} from 'state/data-getters';

const SFTPCard = ( { translate, username, password, errorCode, siteId, loading } ) => {
	const sftpData = {
		[ translate( 'URL' ) ]: 'sftp1.wordpress.com',
		[ translate( 'Port' ) ]: 22,
		[ translate( 'Username' ) ]: username,
	};

	return (
		<Card>
			<div className="hosting__icon-col">
				<MaterialIcon className="hosting__card-icon" icon="cloud" size={ 32 } />
			</div>
			<div className="hosting__card-col">
				<CardHeading>{ translate( 'SFTP Information' ) }</CardHeading>
				<p>{ translate( "Access and edit your website's files directly using an FTP client." ) }</p>
				{ password && (
					<div className="hosting__callout-box">
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
				{ errorCode === 404 && (
					<Button onClick={ createAtomicSFTPUser } primary>
						Create SFTP User
					</Button>
				) }
				<table className={ classNames( 'hosting__info-table', { [ 'is-placeholder' ]: loading } ) }>
					<tbody>
						{ map( sftpData, ( data, title ) => (
							<tr key={ title } >
								<th>{ title }:</th>
								<td>
									<span>{ ! loading && data }</span>
								</td>
							</tr>
						) ) }
						<tr>
							<th>{ translate( 'Password' ) }:</th>
							<td>
								<Button
									onClick={ () => resetAtomicSFTPUserPassword( siteId ) }
									disabled={ loading }
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
	const sftpDetails = requestAtomicSFTPDetails( siteId );
	const username = get( sftpDetails, 'data.username', null );

	return {
		siteId,
		username,
		password: get( sftpDetails, 'data.password', null ),
		errorCode: get( sftpDetails, 'error.status', null ),
		loading: get( sftpDetails, 'status', null ) === 'pending' || ! username,
	};
} )( localize( SFTPCard ) );
