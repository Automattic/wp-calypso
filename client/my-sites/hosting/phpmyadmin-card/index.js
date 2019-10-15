/** @format */

/**
 * External dependencies
 */
import React, { useEffect } from 'react';
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

const requestId = siteId => `pma-link-request-${ siteId }`;

export const requestPmaLink = siteId =>
	requestHttpData(
		requestId( siteId ),
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/hosting/pma`,
				apiNamespace: 'wpcom/v2',
			},
			{}
		),
		{
			fromApi: () => ( { pmaUrl } ) => {
				return [ [ requestId( siteId ), { pmaUrl } ] ];
			},
		}
	);

const PhpMyAdminCard = ( { translate, siteId, pmaLink, loading } ) => {
	useEffect( () => {
		if ( pmaLink ) {
			window.open( pmaLink );
		}
	}, [ pmaLink ] );

	return (
		<Card>
			<div className="phpmyadmin-card__icon-col">
				<MaterialIcon icon="dns" size={ 32 } />
			</div>
			<div>
				<CardHeading>{ translate( 'Database Access' ) }</CardHeading>
				<p>
					{ translate(
						'Manage your databases with PHPMyAdmin and run a wide range of operations with MySQL.'
					) }
				</p>
				<Button onClick={ () => requestPmaLink( siteId ) } busy={ loading }>
					{ translate( 'Access PHPMyAdmin' ) }
				</Button>
			</div>
		</Card>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const pmaLinkRequest = getHttpData( requestId( siteId ) );

	return {
		pmaLink: get( pmaLinkRequest, 'data.pmaUrl', null ),
		loading: get( pmaLinkRequest, 'status', null ) === 'pending',
		siteId,
	};
} )( localize( PhpMyAdminCard ) );
