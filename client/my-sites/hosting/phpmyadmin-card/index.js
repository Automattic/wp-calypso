/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import MaterialIcon from 'components/material-icon';
import Button from 'components/button';

const PhpMyAdminCard = ( { translate } ) => {
	return (
		<Card>
			<div className="hosting__card-icon-col">
				<MaterialIcon className="hosting__card-icon" icon="dns" size={ 32 } />
			</div>
			<div className="hosting__card-col">
				<CardHeading>{ translate( 'Database Access' ) }</CardHeading>
				<p>
					{ translate(
						'Manage your databases with PHPMyAdmin and run a wide range of operations with MySQL.'
					) }
				</p>
				<Button>{ translate( 'Access PHPMyAdmin' ) }</Button>
			</div>
		</Card>
	);
};

export default localize( PhpMyAdminCard );
