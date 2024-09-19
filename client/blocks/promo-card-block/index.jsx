import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Card, Button } from '@automattic/components';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import FormattedHeader from 'calypso/components/formatted-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getPluginOnSite, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
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
	const selectedSiteId = useSelector( getSelectedSiteId );
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
			{ selectedPlugin || isFetching ? (
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
