import './feed-preview.styles.scss';
import { Reader } from '@automattic/data-stores';
import { Spinner } from '@wordpress/components';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import ReaderFeedItem from 'calypso/blocks/reader-feed-item';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';

interface GetFeedResponse {
	feeds: {
		feed_ID: string;
		subscribe_URL: string;
		meta: object;
	}[];
}

interface FeedPreviewProps {
	url: string;
	source: string;
	onChangeFeedPreview?: ( hasPreview: boolean ) => void;
	onSubscribeToggle?: ( subscribed: boolean ) => void;
}

export default function FeedPreview( props: FeedPreviewProps ): JSX.Element | null {
	const { url, source, onChangeFeedPreview, onSubscribeToggle } = props;
	const dispatch = useDispatch();
	const [ debouncedUrl ] = useDebounce( url, 1000 );
	const [ feed, setFeed ] = useState< Reader.FeedItem >();
	const [ loading, setLoading ] = useState( false );

	/**
	 * Fetch the feed for the given URL.
	 */
	useEffect( (): void => {
		setLoading( true );

		wpcom.req
			.get( '/read/feed', { url: debouncedUrl } )
			.then( ( response: GetFeedResponse ): void => {
				setLoading( false );

				const feed = response?.feeds?.[ 0 ];
				if ( ! feed ) {
					return;
				}

				setFeed( feed );
				onChangeFeedPreview?.( true );
			} )
			.catch( ( err: Error ): void => {
				setFeed( undefined );
				onChangeFeedPreview?.( false );

				throw err;
			} )
			.finally( (): void => {
				setLoading( false );
			} );
	}, [ dispatch, debouncedUrl, onChangeFeedPreview ] );

	const memoizedFeedPreviewContent = useMemo( (): JSX.Element => {
		if ( loading ) {
			return (
				<div className="feed-preview__loader">
					<Spinner /> <p>Loading feed...</p>
				</div>
			);
		}

		if ( ! feed ) {
			return (
				<div className="feed-preview__empty">
					<p>No feed is available at this url.</p>
				</div>
			);
		}

		if ( ! feed?.feed_ID ) {
			return (
				<div className="feed-preview__empty">
					<p>Preview of the feed is not yet available.</p>
				</div>
			);
		}

		return (
			<>
				<ul className="feed-preview__site">
					<ReaderFeedItem feed={ feed } source={ source } onSubscribeToggle={ onSubscribeToggle } />
				</ul>

				<div className="feed-preview__stream">
					<Stream
						className="no-padding"
						streamKey={ `feed:${ feed?.feed_ID }` }
						useCompactCards
						showFollowButton={ false }
						trackScrollPage={ () => {} }
						suppressSiteNameLink
						showBack={ false }
					/>
				</div>
			</>
		);
	}, [ feed, loading, source, onSubscribeToggle ] );

	return <div className="feed-preview">{ memoizedFeedPreviewContent }</div>;
}
