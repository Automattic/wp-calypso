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
import Accordion from 'components/accordion';
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
					'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
				) }
			</p>
			<div className="phpmyadmin-card__questions">
				<Accordion title={ translate( 'Do I need to Access my Database?' ) }>
					{ translate(
						'{{p}}Accessing your database is not required for your site to function. Do not touch your site’s database unless you have a very specific reason. If you’re unsure, contact a Happiness Engineer for help before accessing your database.{{/p}}' +
							'{{p}}{{strong}}You should not ever run a command unless you know exactly what it will do.{{/strong}}{{/p}}' +
							'{{p}}If you don’t understand what a command does, don’t run it. Running unknown commands without understanding them may lead to your site breaking, and can also cause you to lose data.{{/p}}' +
							'{{p}}You may have come across articles that suggest manipulating the database to improve various aspects of your site. Here at WordPress.com we’ve already taken steps to ensure your site is optimized, and you should not need to do anything with your database directly.{{/p}}' +
							'{{p}}We are happy to help with your site, however WordPress.com Happiness Engineers are not here to assist you with creating, modifying, or running database commands.{{/p}}',
						{
							components: {
								p: <p />,
								strong: <strong />,
							},
						}
					) }
				</Accordion>
				<Accordion title={ translate( 'Reasons to Access my Database' ) }>
					{ translate(
						"{{p}}We allow full database access for any custom data needs you may have . Please only access this if you know what you're doing.{{/p}}",
						{
							components: {
								p: <p />,
							},
						}
					) }
				</Accordion>
			</div>
			<p className="phpmyadmin-card__db-warning">
				{ translate(
					"Managing a database can be tricky. Only access if you know what you're doing. {{strong}}Need to manage your database?{{/strong}}",
					{
						components: {
							strong: <strong />,
						},
					}
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
					{ translate( 'Having problems with access? Try {{a}}resetting the password{{/a}}.', {
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
