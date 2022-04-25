import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'calypso/data/media/use-media-query';
import { useMediaContext } from 'calypso/my-sites/media/context';
import { getTransientMediaItems } from 'calypso/state/selectors/get-transient-media-items';

export const withMedia = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { site } = props;
		const { query } = useMediaContext();
		const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMediaQuery(
			site.ID,
			query
		);

		// @TODO move this to `useMediaQuery.select`
		const transientMediaItems = useSelector( ( state ) =>
			getTransientMediaItems( state, site.ID )
		);

		const media = data?.media ?? [];
		const mediaWithTransientItems = transientMediaItems.length
			? transientMediaItems.concat( media )
			: media;

		return (
			<Wrapped
				{ ...props }
				media={ mediaWithTransientItems }
				hasNextPage={ hasNextPage }
				fetchNextPage={ fetchNextPage }
				isLoading={ isLoading }
				isFetchingNextPage={ isFetchingNextPage }
			/>
		);
	},
	'WithMedia'
);
