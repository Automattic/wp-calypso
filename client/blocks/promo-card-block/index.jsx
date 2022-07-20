import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from 'page';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import PromoCard from 'calypso/components/promo-card';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PromoCardBlock = ( props ) => {
	const { productSlug, clickEvent, href, impressionEvent } = props;
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const selectedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, productSlug )
	);

	const onClick = useCallback( () => {
		recordTracksEvent( clickEvent );
		page( href );
	}, [ clickEvent, href ] );

	return (
		<>
			<QueryProductsList />
			<TrackComponentView eventName={ impressionEvent } />
			{ selectedPlugin ? <div></div> : <PromoCard { ...{ ...props, onClick } } /> }
		</>
	);
};

export default PromoCardBlock;
