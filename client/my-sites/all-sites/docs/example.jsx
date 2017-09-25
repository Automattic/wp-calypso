/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import AllSites from 'my-sites/all-sites';

const AllSitesExample = () => (
	<Card style={ { padding: 0 } }>
		<AllSites />
	</Card>
);

AllSitesExample.displayName = 'AllSites';

export default AllSitesExample;
