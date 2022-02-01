import { createHigherOrderComponent } from '@wordpress/compose';
import useP2HubP2sQuery from 'calypso/data/p2/use-p2-hub-p2s-query';

const withP2HubHasP2s = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { data } = useP2HubP2sQuery( props.siteId, { limit: 1 } );
		const hasP2s = data?.totalItems > 0;
		return <Wrapped { ...props } p2HubHasP2s={ hasP2s } />;
	},
	'withP2HubHasP2s'
);

export default withP2HubHasP2s;
