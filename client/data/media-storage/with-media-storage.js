import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useMediaStorageQuery from './use-media-storage-query';

export {
	KB_IN_BYTES,
	MB_IN_BYTES,
	GB_IN_BYTES,
	TB_IN_BYTES,
	PB_IN_BYTES,
	EB_IN_BYTES,
	ZB_IN_BYTES,
	YB_IN_BYTES,
} from './use-media-storage-query';

const withMediaStorage = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data } = useMediaStorageQuery( siteId );

		return <Wrapped { ...props } mediaStorage={ data ?? {} } />;
	},
	'WithMediaStorage'
);

export default withMediaStorage;
