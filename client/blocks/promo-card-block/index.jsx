import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Card, Button } from '@automattic/components';
import page from 'page';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import FormattedHeader from 'calypso/components/formatted-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getPluginOnSite, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const PromoCardBlock = ( {
	clickEvent,
	contentText,
	ctaText,
	headerText,
	href,
	image,
	impressionEvent,
	productSlug,
} ) => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const selectedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, productSlug )
	);
	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);
	const isFetching = useSelector( ( state ) => isRequestingForSites( state, [ selectedSiteId ] ) );

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

					<Card className="promo-card-block">
						<img src={ image } alt="" />
						<div className="promo-card-block__text">
							<FormattedHeader brandFont headerText={ headerText } align="left" />
							<p>{ contentText }</p>
							<Button primary onClick={ onClick } target="_blank">
								{ ctaText }
							</Button>
						</div>
					</Card>
				</>
			) }
		</>
	);
};

export default PromoCardBlock;
