import { Card } from '@automattic/components';
import AllSites from 'calypso/blocks/all-sites';

const AllSitesExample = () => (
	<Card style={ { padding: 0 } }>
		<AllSites />
	</Card>
);

AllSitesExample.displayName = 'AllSites';

export default AllSitesExample;
