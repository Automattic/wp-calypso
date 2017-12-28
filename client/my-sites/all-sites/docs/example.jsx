/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import AllSites from 'client/my-sites/all-sites';
import Card from 'client/components/card';

const AllSitesExample = () => (
	<Card style={ { padding: 0 } }>
		<AllSites />
	</Card>
);

AllSitesExample.displayName = 'AllSites';

export default AllSitesExample;
