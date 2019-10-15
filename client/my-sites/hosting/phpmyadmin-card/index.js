/** @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
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
import { requestPmaLink } from 'state/data-getters';
import { getSelectedSiteId } from 'state/ui/selectors';

const PhpMyAdminCard = ( { translate, siteId } ) => {
	const [ request, setRequest ] = useState( null );

	const pmaLink = get( request, 'data.pmaLink', null );
	const loading = get( request, 'status', null ) === 'pending';

	if ( pmaLink ) {
		window.open( pmaLink );
	}

	const handlePmaLogin = () => {
		setRequest( requestPmaLink( siteId ) );
	};

	return (
		<Card>
			<div className="hosting__card-icon-col">
				<MaterialIcon className="hosting__card-icon" icon="dns" size={ 32 } />
			</div>
			<div className="hosting__card-col">
				<CardHeading>
					{ translate( 'Database Access' ) }
				</CardHeading>
				<p>
					{ translate(
						'Manage your databases with PHPMyAdmin and run a wide range of operations with MySQL.'
					) }
				</p>
				<Button onClick={ handlePmaLogin } busy={ loading }>{ translate( 'Access PHPMyAdmin' ) }</Button>
			</div>
		</Card>
	);
};

export default connect( state => {
	return {
		siteId: getSelectedSiteId( state )
	};
} )( localize( PhpMyAdminCard ) );
