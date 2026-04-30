import { createHigherOrderComponent } from '@wordpress/compose';
import useP2HubP2sQuery from 'calypso/data/p2/use-p2-hub-p2s-query';

const withP2HubP2Count = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		// Limit query to 1 since we are only interested in the totalItems count.
		const { data } = useP2HubP2sQuery( props.siteId, { limit: 1 } );
		return <Wrapped { ...props } p2HubP2Count={ data?.totalItems || 0 } />;
	},
	'withP2HubP2Count'
);

export default withP2HubP2Count;
