/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import AllSites from 'calypso/blocks/all-sites';
import { Card } from '@automattic/components';

const AllSitesExample = () => (
	<Card style={ { padding: 0 } }>
		<AllSites />
	</Card>
);

AllSitesExample.displayName = 'AllSites';

export default AllSitesExample;
