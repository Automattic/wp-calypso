/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

const TooExpensive = ( { translate } ) => (
	<div>
		<Card className="disconnect-site__question">
			<p>{ translate( 'Would you like to downgrade your plan?' ) }</p>
			<div>
				<Button compact>Yes</Button>
				<Button compact>No</Button>
			</div>
		</Card>
	</div>
);

export default localize( TooExpensive );
