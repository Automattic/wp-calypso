import './feed-preview.styles.scss';
import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
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
}

export default function FeedPreview( props: FeedPreviewProps ): JSX.Element | null {
	const { url, source } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ debouncedUrl ] = useDebounce( url, 700 );
	const [ feed, setFeed ] = useState< Reader.FeedItem >();

	/**
	 * Fetch the feed for the given URL.
	 */
	useEffect( (): void => {
		setFeed( undefined ); // Reset feed before each request.

		wpcom.req
			.get( '/read/feed', { url: debouncedUrl } )
			.then( ( response: GetFeedResponse ): void => {
				const feed = response?.feeds?.[ 0 ];
				if ( ! feed ) {
					return;
				}

				setFeed( feed );
			} );
	}, [ dispatch, debouncedUrl, translate ] );

	const FeedPreviewContent = (): JSX.Element | null => {
		if ( ! feed ) {
			return null;
		}

		return (
			<>
				<ul className="feed-preview__site">
					<ReaderFeedItem feed={ feed } source={ source } />
				</ul>

				<div className="feed-preview__stream">
					<Stream
						className="no-padding"
						streamKey={ `feed:${ feed.feed_ID }` }
						useCompactCards
						showFollowButton={ false }
						suppressSiteNameLink
					/>
				</div>
			</>
		);
	};

	return (
		<div className="feed-preview">
			<FeedPreviewContent />
		</div>
	);
}
