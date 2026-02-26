import { recordTrainTracksRender } from '@automattic/calypso-analytics';
import { Reader } from '@automattic/data-stores';
import { useEffect } from 'react';

export const RailcarRenderer = ( {
	feed,
	customProps = {},
	children,
}: {
	feed: Reader.FeedItem;
	customProps?: Record< string, string | number >;
	children: React.ReactNode;
} ) => {
	const railcar = feed.railcar;

	useEffect( () => {
		if ( railcar ) {
			recordTrainTracksRender( {
				railcarId: railcar.railcar,
				uiAlgo: 'reader-subscriptions-search',
				uiPosition: index ?? -1,
				fetchAlgo: railcar.fetch_algo,
				fetchPosition: railcar.fetch_position,
				recBlogId: railcar.rec_blog_id,
				...customProps,
			} );
		}
	}, [ railcar, customProps ] );

	return children;
};
