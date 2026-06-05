import page from '@automattic/calypso-router';
import { useEffect, useRef } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import ReaderMain from 'calypso/reader/components/reader-main';
import { isPaddingStreamItem, useInfiniteStream } from 'calypso/reader/data/stream';
import PostLifecycle from 'calypso/reader/stream/post-lifecycle';
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

function Read295PocListItem( { item, index } ) {
	const postKey = getPostKeyFromStreamItem( item );
	const path = getPostPath( postKey );
	const handleClick = () => {
		if ( path ) {
			page( path );
		}
	};

	if ( ! postKey ) {
		return null;
	}

	return (
		<div className="read-295-poc__item" id={ `read-295-poc-post-${ index + 1 }` }>
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

function AutoFetchNextPage( { fetchNextPage, hasNextPage, isFetchingNextPage } ) {
	const sentinelRef = useRef( null );

	useEffect( () => {
		const sentinel = sentinelRef.current;
		if ( ! sentinel || ! hasNextPage || isFetchingNextPage ) {
			return;
		}

		const observer = new IntersectionObserver(
			( entries ) => {
				if ( entries.some( ( entry ) => entry.isIntersecting ) ) {
					fetchNextPage();
				}
			},
			{ rootMargin: '800px 0px' }
		);

		observer.observe( sentinel );

		return () => observer.disconnect();
	}, [ fetchNextPage, hasNextPage, isFetchingNextPage ] );

	if ( ! hasNextPage ) {
		return null;
	}

	return (
		<div className="read-295-poc__load-more" ref={ sentinelRef }>
			{ isFetchingNextPage ? 'Carregando mais posts...' : ' ' }
		</div>
	);
}

function Read295PocList() {
	const stream = useInfiniteStream( { streamKey: POC_STREAM_KEY } );
	const items = stream.items.filter( ( item ) => ! isPaddingStreamItem( item ) );

	return (
		<ReaderMain className="read-295-poc read-295-poc--list">
			{ stream.error && (
				<div className="read-295-poc__notice">Erro ao carregar o feed nesta POC.</div>
			) }

			<div className="read-295-poc__list">
				{ items.map( ( item, index ) => (
					<Read295PocListItem item={ item } index={ index } key={ `${ item.postId }-${ index }` } />
				) ) }
			</div>

			<AutoFetchNextPage
				fetchNextPage={ stream.fetchNextPage }
				hasNextPage={ stream.hasNextPage }
				isFetchingNextPage={ stream.isFetchingNextPage }
			/>
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
