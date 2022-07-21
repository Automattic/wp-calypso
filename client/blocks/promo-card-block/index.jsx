import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from 'page';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import PromoCard from 'calypso/components/promo-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getPluginOnSite, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PromoCardBlock = ( props ) => {
	const { productSlug, clickEvent, href, impressionEvent } = props;

	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const selectedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, productSlug )
	);
	const isFetching = useSelector( ( state ) => isRequestingForSites( state, [ selectedSiteId ] ) );

	const onClick = useCallback( () => {
		recordTracksEvent( clickEvent );
		page( href );
	}, [ clickEvent, href ] );

	return (
		<>
			<QueryJetpackPlugins siteIds={ [ selectedSiteId ] } />
			<TrackComponentView eventName={ impressionEvent } />
			{ selectedPlugin || isFetching ? <div></div> : <PromoCard { ...{ ...props, onClick } } /> }
		</>
	);
};

export default PromoCardBlock;
