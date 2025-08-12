import './feed-preview.styles.scss';
import { Reader } from '@automattic/data-stores';
import { Spinner } from '@wordpress/components';
import { useState, useEffect, useMemo } from 'react';
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
	onChangeSubscribe?: ( subscribed: boolean ) => void;
}

export default function FeedPreview( props: FeedPreviewProps ): JSX.Element | null {
	const { url, source, onChangeFeedPreview, onChangeSubscribe } = props;
	const [ debouncedUrl ] = useDebounce( url, 500 );
	const [ feed, setFeed ] = useState< Reader.FeedItem >();
	const [ loading, setLoading ] = useState( false );

	/**
	 * Fetch the feed for the given URL.
	 */
	useEffect( (): void => {
		onToggleFeedPreview( undefined ); // Adding this before debouncedUrl check to clear the feed preview when the url is empty and no API call is made.

		if ( ! debouncedUrl ) {
			return;
		}

		setLoading( true );

		wpcom.req
			.get( '/read/feed', { url: debouncedUrl } )
			.then( ( response: GetFeedResponse ): void => {
				const feed = response?.feeds?.[ 0 ];
				if ( ! feed ) {
					return;
				}

				onToggleFeedPreview( feed );
			} )
			.catch( ( err: Error ): void => {
				onToggleFeedPreview( undefined );

				throw err;
			} )
			.finally( (): void => {
				setLoading( false );
			} );

		function onToggleFeedPreview( feed?: Reader.FeedItem ): void {
			setFeed( feed );
			onChangeFeedPreview?.( !! feed?.feed_ID );
		}
	}, [ debouncedUrl, onChangeFeedPreview ] );

	const memoizedFeedPreviewContent = useMemo( (): JSX.Element => {
		if ( loading ) {
			return (
				<div className="feed-preview__loader">
					<Spinner /> <p>Loading feed preview...</p>
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
		return (
			<>
				<ul className="feed-preview__site">
					<ReaderFeedItem feed={ feed } source={ source } onChangeSubscribe={ onChangeSubscribe } />
				</ul>

				{
					// Show stream if preview is available otherwise show a message. Commonly preview is not available for new feeds.
					feed?.feed_ID ? (
						<div className="feed-preview__stream">
							<Stream
								className="no-padding"
								streamKey={ `feed:${ feed?.feed_ID }` }
								showFollowButton={ false }
								showBack={ false }
								trackScrollPage={ () => {} }
								useCompactCards
								suppressSiteNameLink
							/>
						</div>
					) : (
						<div className="feed-preview__empty">
							<p>Preview of the feed is not yet available.</p>
						</div>
					)
				}
			</>
		);
	}, [ feed, loading, source, onChangeSubscribe ] );

	if ( ! url ) {
		return null;
	}

	return <div className="feed-preview">{ memoizedFeedPreviewContent }</div>;
}
