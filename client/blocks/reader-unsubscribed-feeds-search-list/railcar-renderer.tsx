import { recordTrainTracksRender } from '@automattic/calypso-analytics';
import { Reader } from '@automattic/data-stores';
import { useEffect } from 'react';

export const RailcarRenderer = ( {
	feed,
	uiPosition,
	children,
}: {
	feed: Reader.FeedItem;
	uiPosition: number;
	children: React.ReactNode;
} ) => {
	const railcar = feed.railcar;

	useEffect( () => {
		if ( railcar ) {
			recordTrainTracksRender( {
				railcarId: railcar.railcar,
				uiAlgo: 'reader-subscriptions-search',
				fetchAlgo: railcar.fetch_algo,
				fetchPosition: railcar.fetch_position,
				recBlogId: railcar.rec_blog_id,
				uiPosition: uiPosition ?? -1,
			} );
		}
	}, [ railcar, uiPosition ] );

	return children;
};
