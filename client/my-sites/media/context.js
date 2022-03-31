import { createHigherOrderComponent } from '@wordpress/compose';
import { createContext, useContext, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'calypso/data/media/use-media-query';
import { getMimeBaseTypeFromFilter } from 'calypso/data/media/utils';
import { getTransientMediaItems } from 'calypso/state/selectors/get-transient-media-items';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const getQuery = ( { search, source, filter, postId } ) => {
	const query = {};

	if ( search ) {
		query.search = search;
	}

	if ( filter && ! source ) {
		if ( filter === 'this-post' ) {
			if ( postId ) {
				query.post_ID = postId;
			}
		} else {
			query.mime_type = getMimeBaseTypeFromFilter( filter );
		}
	}

	if ( source ) {
		query.source = source;
		query.path = 'recent';

		// @TODO
		// if ( source === 'google_photos' ) {
		// 	// Add any query params specific to Google Photos
		// 	return utils.getGoogleQuery( query, props );
		// }
	}

	return query;
};

export const MediaContext = createContext( {
	selectedItemsIds: [],
	selectMediaItems: () => {},
	replaceSelectedMediaItem: () => {},
	addToSelectedItems: () => {},
	query: {},
	setQuery: () => {},
} );

export const useMediaContext = () => {
	return useContext( MediaContext );
};

export const useSelectedItems = () => {
	const {
		query,
		selectedItemsIds,
		selectMediaItems,
		replaceSelectedMediaItem,
		addToSelectedItems,
	} = useMediaContext();

	const siteId = useSelector( getSelectedSiteId );
	const { data } = useMediaQuery( siteId, query );

	const transientMediaItems = useSelector( ( state ) => getTransientMediaItems( state, siteId ) );

	const media = data?.media ?? [];
	const mediaWithTransientItems = transientMediaItems.length
		? transientMediaItems.concat( media )
		: media;

	const selectedItems = selectedItemsIds
		.map( ( mediaId ) => mediaWithTransientItems.find( ( { ID } ) => ID === mediaId ) )
		.filter( ( i ) => i );

	return { selectedItems, selectMediaItems, replaceSelectedMediaItem, addToSelectedItems };
};

export const withSelectedItems = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { selectedItems, selectMediaItems } = useSelectedItems();

		return (
			<Wrapped { ...props } selectedItems={ selectedItems } selectMediaItems={ selectMediaItems } />
		);
	},
	'WithSelectedItems'
);

export const MediaContextProvider = ( { children } ) => {
	const [ query, setQuery ] = useState( {} );
	const [ selectedItemsIds, setSelectedItemsIds ] = useState( [] );

	const selectMediaItems = useCallback(
		( media = [] ) => {
			setSelectedItemsIds( media.map( ( { ID } ) => ID ) );
		},
		[ setSelectedItemsIds ]
	);

	const addToSelectedItems = useCallback(
		( media = [] ) => {
			setSelectedItemsIds( ( existingIds ) => {
				const nextIds = media.reduce(
					( aggregatedIds, { ID: mediaId } ) =>
						existingIds.includes( mediaId ) ? aggregatedIds : [ ...aggregatedIds, mediaId ],
					[ ...existingIds ]
				);

				return nextIds;
			} );
		},
		[ setSelectedItemsIds ]
	);

	const replaceSelectedMediaItem = useCallback(
		( ID, mediaItem ) => {
			setSelectedItemsIds( ( prevIds ) =>
				prevIds.map( ( mediaId ) => ( mediaId === ID ? mediaItem.ID : mediaId ) )
			);
		},
		[ setSelectedItemsIds ]
	);

	return (
		<MediaContext.Provider
			value={ {
				selectedItemsIds,
				selectMediaItems,
				addToSelectedItems,
				replaceSelectedMediaItem,
				query,
				setQuery: ( options ) => setQuery( getQuery( options ) ),
			} }
		>
			{ children }
		</MediaContext.Provider>
	);
};

export const withMediaContextProvider = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		return (
			<MediaContextProvider>
				<Wrapped { ...props } />
			</MediaContextProvider>
		);
	},
	'WithMediaContextProvider'
);
