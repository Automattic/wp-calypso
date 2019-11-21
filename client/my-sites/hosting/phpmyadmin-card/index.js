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
import { getHttpData, requestHttpData, resetHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import RestorePasswordDialog from './restore-db-password';

/**
 * Style dependencies
 */
import './style.scss';

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
		if ( token ) {
			window.open( `https://wordpress.com/pma-login?token=${ token }` );
		}
		return () => resetHttpData( requestId( siteId ) );
	}, [ token, siteId ] );

	const [ isRestorePasswordDialogVisible, setIsRestorePasswordDialogVisible ] = useState( false );

	return (
		<Card className="phpmyadmin-card">
			<MaterialIcon icon="dns" size={ 32 } />
			<CardHeading>{ translate( 'Database Access' ) }</CardHeading>
			<p>
				{ translate(
					'Manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
				) }
			</p>
			<Button
				onClick={ () => requestPmaLink( siteId ) }
				busy={ ! disabled && loading }
				disabled={ disabled }
			>
				<span>{ translate( 'Open phpMyAdmin' ) }</span>
				<MaterialIcon icon="launch" size={ 16 } />
			</Button>
			{ ! disabled && (
				<div className="phpmyadmin-card__restore-password">
					{ translate(
						'Problems accessing your database? Try {{a}}restoring the database password{{/a}}.',
						{
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
						}
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
