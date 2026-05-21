import './post-actions-menu.scss';

import { useDeletePostMutation } from '@automattic/api-queries';
import { Button, DropdownMenu, Modal, __experimentalHStack as HStack } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { rkeyFromUri } from 'calypso/reader/social/utils/rkey-from-uri';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useSocialAnalytics } from './analytics-context';
import type { AtmosphereError, AtmosphereFeedItem } from '@automattic/api-core';

interface PostActionsMenuProps {
	post: {
		uri: string;
		author: Pick< AtmosphereFeedItem[ 'author' ], 'did' >;
		reply_parent: { uri: string } | null;
	};
	connectionId: number;
}

function errorMessageForDelete(
	err: AtmosphereError,
	t: ReturnType< typeof useTranslate >
): string {
	switch ( err.kind ) {
		case 'auth_required':
		case 'auth_failed':
		case 'invalid_credentials':
			return t( 'Something went wrong with your Bluesky connection. Try again.' ) as string;
		case 'rate_limited':
			return t( "You're deleting too quickly. Try again in a moment." ) as string;
		case 'connection_not_found':
			return t( 'This connection no longer exists.' ) as string;
		case 'upstream_unavailable':
			return t( 'Bluesky is taking longer than usual. Please try again.' ) as string;
		case 'bad_request':
		case 'invalid_handle':
		case 'text_too_long':
		case 'reply_disabled':
		case 'quote_disabled':
		case 'target_unavailable':
		case 'not_found':
		case 'unknown':
		case 'blob_decode_failed':
			return t( "Couldn't delete that post. Please try again." ) as string;
		default:
			// Defensive fallback if AtmosphereError widens before this
			// switch is updated. TypeScript exhaustiveness keeps this
			// branch unreachable today; without it, an empty-toast notice
			// would render via `errorNotice( undefined )` for a kind we
			// haven't classified yet. See `client/reader/AGENTS.md` —
			// "Add a default: arm to error-message switches."
			return t( "Couldn't delete that post. Please try again." ) as string;
	}
}

export function PostActionsMenu( { post, connectionId }: PostActionsMenuProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const dispatch = useDispatch();
	const [ confirming, setConfirming ] = useState( false );

	// The optimistic removal in `useDeletePostMutation`'s `onMutate` filters
	// the post out of cached lists / tombstones it in threads, which unmounts
	// `<SocialPostCard>` (and this menu) before the DELETE settles. React
	// Query's per-call `mutate(vars, { onSuccess, onError })` callbacks are
	// gated by the observer's `hasListeners()` and are dropped on unmount —
	// the factory's lifecycle callbacks run from the mutation cache instead,
	// so we hook user-facing side effects there to keep the success notice,
	// error notice, and Tracks events firing past the unmount.
	const mutation = useDeletePostMutation( connectionId, {
		onSuccess: ( vars ) => {
			analytics?.onClick( `calypso_reader_${ analytics.source }_post_deleted`, {
				connection_id: connectionId,
				post_uri: vars.postUri,
			} );
			dispatch( successNotice( translate( 'Your post was deleted.' ) ) );
		},
		onError: ( err, vars ) => {
			if ( err.kind === 'not_found' ) {
				// Idempotent — keep optimistic state, no user-facing notice. Emit a
				// dedicated Tracks event so an unexpected 404 spike (auth/race/backend
				// regression) is observable on dashboards instead of fully silent.
				analytics?.onClick( `calypso_reader_${ analytics.source }_post_delete_not_found`, {
					connection_id: connectionId,
					post_uri: vars.postUri,
				} );
				return;
			}
			dispatch( errorNotice( errorMessageForDelete( err, translate ) ) );
			analytics?.onClick( `calypso_reader_${ analytics.source }_post_delete_error_shown`, {
				connection_id: connectionId,
				post_uri: vars.postUri,
				error_kind: err.kind,
			} );
		},
	} );

	const isOwner = Boolean( analytics?.ownerDid && analytics.ownerDid === post.author.did );
	if ( ! isOwner ) {
		return null;
	}

	const rkey = rkeyFromUri( post.uri );
	if ( ! rkey ) {
		return null;
	}

	const handleConfirm = () => {
		if ( mutation.isPending ) {
			return;
		}
		setConfirming( false );
		mutation.mutate( {
			rkey,
			postUri: post.uri,
			replyParentUri: post.reply_parent?.uri,
		} );
	};

	return (
		<>
			<DropdownMenu
				icon={ moreVertical }
				label={ translate( 'Post actions' ) as string }
				className="social-post-actions-menu"
				controls={ [
					{
						title: translate( 'Delete' ) as string,
						onClick: () => setConfirming( true ),
					},
				] }
			/>
			{ confirming && (
				<Modal
					title={ translate( 'Delete this post?' ) as string }
					onRequestClose={ () => setConfirming( false ) }
					size="small"
					className="social-post-actions-menu-confirm"
				>
					<p>{ translate( "This can't be undone." ) }</p>
					<HStack justify="flex-end" spacing={ 2 }>
						<Button
							variant="tertiary"
							onClick={ () => setConfirming( false ) }
							disabled={ mutation.isPending }
						>
							{ translate( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							isDestructive
							onClick={ handleConfirm }
							disabled={ mutation.isPending }
						>
							{ translate( 'Delete' ) }
						</Button>
					</HStack>
				</Modal>
			) }
		</>
	);
}
