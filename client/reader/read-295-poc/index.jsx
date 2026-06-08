import page from '@automattic/calypso-router';
import { useEffect, useRef } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderInfiniteStream from 'calypso/reader/components/reader-infinite-stream';
import ReaderMain from 'calypso/reader/components/reader-main';
import { isPaddingStreamItem, useInfiniteStream } from 'calypso/reader/data/stream';
import PostLifecycle from 'calypso/reader/stream/post-lifecycle';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import 'calypso/reader/stream/style.scss';
import {
	installRead295ScrollDebug,
	logRead295ScrollDebug,
	observeRead295ScrollDebugElement,
	startRead295ScrollDebugTimeline,
} from './scroll-debug';
import './style.scss';

const POC_STREAM_KEY = 'following';

const loadReaderFullPost = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-reader-full-post" */ 'calypso/blocks/reader-full-post'
	);

function valueToNumber( value ) {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}

	const number = Number( value );
	return Number.isFinite( number ) ? number : null;
}

function getPostKeyFromStreamItem( item ) {
	if ( ! item || isPaddingStreamItem( item ) ) {
		return null;
	}

	const postId = valueToNumber( item.postId );
	if ( ! postId ) {
		return null;
	}

	const blogId = valueToNumber( item.blogId );
	if ( blogId ) {
		return { blogId, postId };
	}

	const feedId = valueToNumber( item.feedId );
	if ( feedId ) {
		return { feedId, postId };
	}

	return null;
}

function getPostPath( postKey ) {
	if ( postKey?.blogId ) {
		return `/reader/blogs/${ postKey.blogId }/posts/${ postKey.postId }`;
	}

	if ( postKey?.feedId ) {
		return `/reader/feeds/${ postKey.feedId }/posts/${ postKey.postId }`;
	}

	return null;
}

function Read295PocListItem( { index, item, onShouldMeasure } ) {
	const rowRef = useRef( null );
	const postKey = getPostKeyFromStreamItem( item );
	const path = getPostPath( postKey );
	const handleClick = () => {
		if ( path ) {
			logRead295ScrollDebug( 'card navigate', { index, path, postKey } );
			startRead295ScrollDebugTimeline( 'card navigate' );
			page( path );
		}
	};

	useEffect( () => {
		const row = rowRef.current;
		if ( ! row || ! onShouldMeasure || ! window.ResizeObserver ) {
			return;
		}

		const observer = new window.ResizeObserver( () => onShouldMeasure() );
		observer.observe( row );

		return () => observer.disconnect();
	}, [ onShouldMeasure ] );

	if ( ! postKey ) {
		return (
			<div className="read-295-poc__item" ref={ rowRef }>
				<PostPlaceholder />
			</div>
		);
	}

	return (
		<div className="read-295-poc__item" id={ `read-295-poc-post-${ index + 1 }` } ref={ rowRef }>
			<PostLifecycle
				blockedSites={ [] }
				compact={ false }
				fixedHeaderHeight={ 0 }
				handleClick={ handleClick }
				index={ index }
				isDiscoverStream={ false }
				isSelected={ false }
				postKey={ postKey }
				showBylineSecondarySiteLink={ false }
				showFollowButton={ false }
				showSiteName
				streamKey={ POC_STREAM_KEY }
			/>
		</div>
	);
}

function read295PocRowRenderer( { items, measuredRowRenderer, rowRendererProps } ) {
	return measuredRowRenderer(
		Read295PocListItem,
		{
			index: rowRendererProps.index,
			item: items[ rowRendererProps.index ],
		},
		rowRendererProps
	);
}

function Read295PocVirtualizedList( { fetchNextPage, hasNextPage, items, width } ) {
	useEffect( () => {
		logRead295ScrollDebug( 'virtualized list update', {
			itemsLength: items.length,
			width,
		} );
		startRead295ScrollDebugTimeline( 'virtualized list update' );
	}, [ items.length, width ] );

	return (
		<ReaderInfiniteStream
			fetchNextPage={ fetchNextPage }
			hasNextPage={ hasNextPage }
			items={ items }
			minHeight={ 220 }
			rowRenderer={ read295PocRowRenderer }
			width={ width }
		/>
	);
}

const Read295PocVirtualizedListWithDimensions = withDimensions( Read295PocVirtualizedList );

function Read295PocList() {
	const listRef = useRef( null );
	const stream = useInfiniteStream( { streamKey: POC_STREAM_KEY } );
	const items = stream.items.filter( ( item ) => ! isPaddingStreamItem( item ) );
	const fetchNextPage = () => {
		if ( stream.hasNextPage && ! stream.isFetchingNextPage ) {
			stream.fetchNextPage();
		}
	};
	const hasNextPage = () => stream.hasNextPage;

	useEffect( () => {
		installRead295ScrollDebug();
		logRead295ScrollDebug( 'list mounted', {
			itemsLength: items.length,
			hasNextPage: stream.hasNextPage,
			isFetchingNextPage: stream.isFetchingNextPage,
		} );
		startRead295ScrollDebugTimeline( 'list mounted' );

		const stopObserving = observeRead295ScrollDebugElement( 'read-295-poc list', listRef.current );

		return () => {
			logRead295ScrollDebug( 'list unmounted', {
				itemsLength: items.length,
			} );
			stopObserving?.();
		};
		// Keep this mount/unmount logger scoped to the component lifecycle.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		logRead295ScrollDebug( 'list data update', {
			itemsLength: items.length,
			rawItemsLength: stream.items.length,
			hasNextPage: stream.hasNextPage,
			isFetchingNextPage: stream.isFetchingNextPage,
		} );
		startRead295ScrollDebugTimeline( 'list data update' );
	}, [ items.length, stream.hasNextPage, stream.isFetchingNextPage, stream.items.length ] );

	return (
		<ReaderMain className="read-295-poc read-295-poc--list following">
			{ stream.error && (
				<div className="read-295-poc__notice">Erro ao carregar o feed nesta POC.</div>
			) }

			<div className="stream__container">
				<div className="reader__content">
					<div className="read-295-poc__list stream__list" ref={ listRef }>
						<Read295PocVirtualizedListWithDimensions
							fetchNextPage={ fetchNextPage }
							hasNextPage={ hasNextPage }
							items={ items }
						/>
					</div>
				</div>
			</div>
		</ReaderMain>
	);
}

function Read295PocPost( { sourceType, sourceId, postId } ) {
	const postProps =
		sourceType === 'blog' ? { blogId: sourceId, postId } : { feedId: sourceId, postId };

	return (
		<div className="read-295-poc read-295-poc--full-post">
			<AsyncLoad disableScrollManagement require={ loadReaderFullPost } { ...postProps } />
		</div>
	);
}

export default function Read295Poc( { sourceType, sourceId, postId } ) {
	if ( postId ) {
		return <Read295PocPost postId={ postId } sourceId={ sourceId } sourceType={ sourceType } />;
	}

	return <Read295PocList />;
}
