/** @format */

/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import MaterialIcon from 'components/material-icon';
import Button from 'components/button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import RestorePasswordDialog from './restore-db-password';

const requestId = siteId => `pma-link-request-${ siteId }`;

export const requestPmaLink = siteId =>
	requestHttpData(
		requestId( siteId ),
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/hosting/pma/token`,
				apiNamespace: 'wpcom/v2',
				body: {},
			},
			{}
		),
		{
			fromApi: () => ( { token } ) => {
				return [ [ requestId( siteId ), { token } ] ];
			},
			freshness: 0,
		}
	);

const PhpMyAdminCard = ( { translate, siteId, token, loading, disabled } ) => {
	useEffect( () => {
		if ( token && ! loading ) {
			window.open( `https://wordpress.com/pma-login?token=${ token }` );
		}
	}, [ token, loading ] );

	const [ isRestorePasswordDialogVisible, setIsRestorePasswordDialogVisible ] = useState( false );

	return (
		<Card className="phpmyadmin-card">
			<div className="phpmyadmin-card__icon">
				<MaterialIcon icon="dns" size={ 32 } />
			</div>
			<div>
				<CardHeading>{ translate( 'Database Access' ) }</CardHeading>
				<p>
					{ translate(
						'Manage your databases with PHPMyAdmin and run a wide range of operations with MySQL.'
					) }
				</p>
				<Button
					onClick={ () => requestPmaLink( siteId ) }
					busy={ ! disabled && loading }
					disabled={ disabled }
				>
					<span>{ translate( 'Open PHPMyAdmin' ) }</span>
					<MaterialIcon icon="launch" size={ 16 } />
				</Button>
				{ ! disabled && (
					<div className="phpmyadmin-card__restore-password">
						{ translate( 'Problems accessing the database?' ) }
						&nbsp;
						{ translate( 'Try {{a}}restoring the database password{{/a}}.', {
							components: {
								a: (
									<Button
										compact
										borderless
										onClick={ () => {
											setIsRestorePasswordDialogVisible( true );
										} }
									/>
								),
							},
						} ) }
						&nbsp;
						{ translate(
							'This is useful for cases where the password has accidentally been changed in phpMyAdmin.'
						) }
					</div>
				) }
				<RestorePasswordDialog
					isVisible={ isRestorePasswordDialogVisible }
					onCancel={ () => {
						setIsRestorePasswordDialogVisible( false );
					} }
					onRestore={ () => {
						setIsRestorePasswordDialogVisible( false );
					} }
				/>
			</div>
		</Card>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	const pmaTokenRequest = getHttpData( requestId( siteId ) );

	return {
		token: get( pmaTokenRequest.data, 'token', null ),
		loading: pmaTokenRequest.state === 'pending',
		siteId,
	};
} )( localize( PhpMyAdminCard ) );
