import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useMediaStorageQuery from './use-media-storage-query';

const withMediaStorage = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data } = useMediaStorageQuery( siteId );

		return <Wrapped { ...props } mediaStorage={ data ?? [] } />;
	},
	'WithMediaStorage'
);

export default withMediaStorage;
