import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from 'page';
import { useCallback } from 'react';
import { useIsFetching } from 'react-query';
import { useSelector } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import PromoCard from 'calypso/components/promo-card';
import { getInstalledPluginsCacheKey } from 'calypso/data/plugins/installed/use-plugins-query';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PromoCardBlock = ( props ) => {
	const { productSlug, clickEvent, href, impressionEvent } = props;

	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const selectedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, productSlug )
	);
	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);
	const isFetching = useIsFetching( getInstalledPluginsCacheKey( [ selectedSiteId ] ) );

	const onClick = useCallback( () => {
		recordTracksEvent( clickEvent );
		page( href );
	}, [ clickEvent, href ] );

	return (
		<>
			<QueryJetpackPlugins siteIds={ [ selectedSiteId ] } />
			{ jetpackNonAtomic || selectedPlugin || isFetching ? (
				<div></div>
			) : (
				<>
					<TrackComponentView eventName={ impressionEvent } />
					<PromoCard { ...{ ...props, onClick } } />
				</>
			) }
		</>
	);
};

export default PromoCardBlock;
