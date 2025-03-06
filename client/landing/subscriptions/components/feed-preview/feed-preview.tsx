import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';

interface GetFeedResponse {
	feeds: { feed_ID: number }[];
}

interface FeedPreviewProps {
	url: string;
}

export default function FeedPreview( props: FeedPreviewProps ): JSX.Element | null {
	const { url } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ debouncedUrl ] = useDebounce( url, 700 );
	const [ feedId, setFeedId ] = useState< number >( 0 );

	/**
	 * Fetch the feed ID for the given URL.
	 */
	useEffect( (): void => {
		setFeedId( 0 ); // Reset feed ID before each request.

		wpcom.req
			.get( '/read/feed', { url: debouncedUrl } )
			.then( ( response: GetFeedResponse ): void => {
				const feedId: number | undefined = response?.feeds?.[ 0 ]?.feed_ID;
				if ( ! feedId ) {
					return;
				}

				setFeedId( feedId );
			} );
	}, [ dispatch, debouncedUrl, translate ] );

	const FeedPreviewContent = (): JSX.Element | null => {
		if ( ! feedId ) {
			return null;
		}

		return (
			<div className="feed-preview__stream">
				<Stream
					className="is-site-stream"
					streamKey={ `feed:${ feedId }` }
					useCompactCards
					showFollowButton={ false }
					suppressSiteNameLink
				/>
			</div>
		);
	};

	return (
		<div className="feed-preview">
			<FeedPreviewContent />
		</div>
	);
}
