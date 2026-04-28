import { useMastodonTimelineInfiniteQuery } from '@automattic/api-queries';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { SocialFeedList, SocialPostCard } from 'calypso/reader/social';
import { SocialAnalyticsProvider } from 'calypso/reader/social/components/post-card/analytics-context';
import { mapMastodonFeedItemToSocialPost } from 'calypso/reader/social/mappers/mastodon';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type {
	AtmosphereError,
	MastodonConnection,
	MastodonError,
	MastodonFeedItem,
} from '@automattic/api-core';
import type { SocialPost } from 'calypso/reader/social/types';
import type { AppState } from 'calypso/types';

interface TimelinePanelProps {
	connection: MastodonConnection;
}

// Project MastodonError onto the AtmosphereError shape that SocialFeedList /
// FeedListEmpty currently consume. Both unions share the four kinds the empty
// component switches on (auth_required, rate_limited, upstream_unavailable,
// not_found) plus a few extra kinds that fall through to the default branch.
// This adapter goes away when SocialFeedList is widened to take SocialError
// directly (Task 12 of the CM-626 plan).
function projectError( err: MastodonError | null | undefined ): AtmosphereError | null {
	if ( ! err ) {
		return null;
	}
	switch ( err.kind ) {
		case 'auth_required':
		case 'not_found':
		case 'upstream_unavailable':
		case 'auth_failed':
		case 'connection_not_found':
			return { kind: err.kind };
		case 'rate_limited':
			return err.retry_after !== undefined
				? { kind: 'rate_limited', retry_after: err.retry_after }
				: { kind: 'rate_limited' };
		case 'bad_request':
			return { kind: 'bad_request', message: err.message };
		case 'invalid_instance':
		case 'unknown':
			return { kind: 'unknown', cause: err };
	}
}

export function TimelinePanel( { connection }: TimelinePanelProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const lastErrorKind = useRef< string | null >( null );

	const {
		data,
		isPending,
		isError,
		error,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		refetch,
	} = useMastodonTimelineInfiniteQuery( connection.id );

	const items: SocialPost[] = useMemo(
		() =>
			(
				data?.pages
					.flatMap( ( page ) => page.items ?? [] )
					.filter( ( post ): post is MastodonFeedItem => Boolean( post?.uri ) ) ?? []
			).map( mapMastodonFeedItemToSocialPost ),
		[ data ]
	);

	useEffect( () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_timeline_viewed', {
				connection_id: connection.id,
			} )
		);
	}, [ connection.id, dispatch ] );

	useEffect( () => {
		if ( isError && error && error.kind !== lastErrorKind.current ) {
			lastErrorKind.current = error.kind;
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_mastodon_timeline_error_shown', {
					connection_id: connection.id,
					error_kind: error.kind,
				} )
			);
		}
		if ( ! isError ) {
			lastErrorKind.current = null;
		}
	}, [ isError, error, connection.id, dispatch ] );

	const handleRetry = () => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_mastodon_timeline_retry_clicked', {
				connection_id: connection.id,
				error_kind: error?.kind ?? 'unknown',
			} )
		);
		refetch();
	};

	const onClickAnalytics = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			dispatch( recordReaderTracksEvent( event, props ) );
		},
		[ dispatch ]
	);

	const renderItem = useCallback(
		( post: SocialPost ) => <SocialPostCard post={ post } variant="default" />,
		[]
	);
	const itemKey = useCallback( ( post: SocialPost ) => post.uri, [] );

	return (
		<SocialAnalyticsProvider
			value={ {
				source: 'mastodon',
				connectionId: connection.id,
				onClick: onClickAnalytics,
			} }
		>
			<SocialFeedList< SocialPost >
				items={ items }
				isPending={ isPending }
				isError={ isError }
				error={ projectError( error ) }
				hasNextPage={ Boolean( hasNextPage ) }
				isFetchingNextPage={ isFetchingNextPage }
				fetchNextPage={ fetchNextPage }
				refetch={ handleRetry }
				renderItem={ renderItem }
				itemKey={ itemKey }
				emptyTitle={ translate( "You're all caught up." ) }
				emptyLine={ translate( 'Follow some accounts on Mastodon to see posts here.' ) }
				emptyActionLabel={ translate( 'Open your Mastodon instance' ) }
				emptyActionURL={ `https://${ connection.instance }` }
			/>
		</SocialAnalyticsProvider>
	);
}

export default TimelinePanel;
