import { useCreateLikeMutation, useDeleteLikeMutation } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import { rkeyFromUri } from 'calypso/reader/social/utils/rkey-from-uri';
import { errorNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from './analytics-context';
import type { AtmosphereError, AtmosphereFeedItem } from '@automattic/api-core';

import './like-button.scss';

interface LikeButtonProps {
	post: Pick< AtmosphereFeedItem, 'uri' | 'cid' | 'counts' | 'viewer' >;
	connectionId: number;
}

type LikeDirection = 'like' | 'unlike';

function errorMessageForLike(
	error: AtmosphereError,
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( error.kind ) {
		case 'auth_required':
		case 'auth_failed':
		case 'invalid_credentials':
			return translate( 'Reconnect your Bluesky account to like posts.' );
		case 'rate_limited':
			return translate( "You're liking posts too quickly. Try again in a moment." );
		case 'connection_not_found':
		case 'not_found':
			return translate( 'This connection no longer exists.' );
		case 'bad_request':
		case 'invalid_handle':
		case 'upstream_unavailable':
		case 'unknown':
			return translate( 'Could not save your like. Please try again.' );
	}
}

export function LikeButton( { post, connectionId }: LikeButtonProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const analytics = useSocialAnalytics();
	const create = useCreateLikeMutation( connectionId );
	const remove = useDeleteLikeMutation( connectionId );

	const isLiked = Boolean( post.viewer?.like );
	const isPending = create.isPending || remove.isPending;

	const trackError = ( error: AtmosphereError, direction: LikeDirection ) => {
		dispatch( errorNotice( errorMessageForLike( error, translate ) ) );
		analytics?.onClick( `calypso_reader_${ analytics.source }_like_error_shown`, {
			connection_id: connectionId,
			post_uri: post.uri,
			error_kind: error.kind,
			direction,
		} );
	};

	const onClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		event.stopPropagation();

		if ( isPending ) {
			return;
		}

		if ( isLiked ) {
			const rkey = rkeyFromUri( post.viewer?.like ?? '' );
			if ( ! rkey ) {
				return;
			}

			analytics?.onClick( `calypso_reader_${ analytics.source }_unlike_clicked`, {
				connection_id: connectionId,
				post_uri: post.uri,
			} );
			remove.mutate(
				{ rkey, postUri: post.uri },
				{ onError: ( error ) => trackError( error, 'unlike' ) }
			);
			return;
		}

		analytics?.onClick( `calypso_reader_${ analytics.source }_like_clicked`, {
			connection_id: connectionId,
			post_uri: post.uri,
		} );
		create.mutate(
			{ postUri: post.uri, postCid: post.cid },
			{ onError: ( error ) => trackError( error, 'like' ) }
		);
	};

	return (
		<button
			type="button"
			className={ `social-post-card-like-button${ isLiked ? ' is-liked' : '' }${
				isPending ? ' is-pending' : ''
			}` }
			aria-pressed={ isLiked }
			aria-label={ isLiked ? translate( 'Unlike' ) : translate( 'Like' ) }
			disabled={ isPending }
			onClick={ onClick }
		>
			<ReaderLikeIcon liked={ isLiked } iconSize={ 16 } />
			<span className="social-post-card-like-button__count">
				{ formatNumber( post.counts.likes ) }
			</span>
		</button>
	);
}
