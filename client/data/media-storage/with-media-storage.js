import { Site } from '@automattic/data-stores';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const withMediaStorage = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );

		return <Wrapped { ...props } mediaStorage={ data ?? {} } />;
	},
	'WithMediaStorage'
);

export default withMediaStorage;
