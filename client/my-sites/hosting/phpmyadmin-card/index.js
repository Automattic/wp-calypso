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
import { requestHttpData } from 'state/data-layer/http-data';
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

const PhpMyAdminCard = ( { translate, siteId, pmaLink, loading, disabled } ) => {
	useEffect( () => {
		if ( pmaLink && ! loading ) {
			window.open( pmaLink );
		}
	}, [ pmaLink, loading ] );

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
			</div>
		</Card>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	// @TODO Replace below dummy data when endpoint is concretely figured out.
	const pmaLinkRequest = {
		status: 'pending',
		data: {
			pmaUrl: 'https://fake.phpmyadmin.localhost/',
		},
	};

	return {
		pmaLink: get( pmaLinkRequest, 'data.pmaUrl', null ),
		loading: pmaLinkRequest.status === 'pending',
		siteId,
	};
} )( localize( PhpMyAdminCard ) );
