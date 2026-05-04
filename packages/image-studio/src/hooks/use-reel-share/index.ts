import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore, type ImageStudioActions } from '../../store';
import { ImageStudioEntryPoint } from '../../store';
import { store as videoStudioStore } from '../../stores/video-studio';
import { getReelSharePostPath } from '../../utils/jetpack-script-data';
import {
	trackImageStudioReelShareClicked,
	trackImageStudioReelShareDispatched,
	trackImageStudioReelShareFailed,
	trackImageStudioReelShareInvalidState,
	trackImageStudioReelShareNotConnected,
	trackImageStudioReelShareNotPublished,
} from '../../utils/tracking';

const SOCIAL_STORE = 'jetpack-social-plugin';
const EDITOR_STORE = 'core/editor';
const IG_SERVICE = 'instagram-business';

type ReelShareReason = 'no-connection' | 'post-not-published' | 'no-video' | 'no-script-data';

interface Connection {
	connection_id: string | number;
	service_name: string;
	enabled?: boolean;
}

interface JetpackSocialOptions {
	attached_media?: Array< { id: number; url: string; type: string } >;
	media_source?: string;
	version?: number;
	[ key: string ]: unknown;
}

interface UseReelShareReturn {
	canShare: boolean;
	reason: ReelShareReason | null;
	isVisible: boolean;
	isSharing: boolean;
	handleShare: () => Promise< void >;
}

function getConnectInstagramUrl(): string {
	// Marketing connections page. We don't append a site slug here because Image
	// Studio's bundle doesn't have access to one — the spec's `{site}` token is
	// resolved by Calypso's router when the URL is opened (it redirects to the
	// primary site's marketing page). Opens in a new tab so the Studio modal
	// stays mounted.
	return '/marketing/connections';
}

export function useReelShare(): UseReelShareReturn {
	const sharePath = getReelSharePostPath();

	const {
		currentVideoUrl,
		currentAttachmentId,
		currentDurationSeconds,
		entryPoint,
		isPublished,
		currentMeta,
		hasInstagramConnection,
		nonInstagramConnectionIds,
		isSharing,
	} = useSelect( ( select ) => {
		const videoStore = select( videoStudioStore );
		const studio = select( imageStudioStore );
		const editor = select( EDITOR_STORE ) as
			| {
					isCurrentPostPublished: () => boolean;
					getEditedPostAttribute: ( attr: string ) => unknown;
			  }
			| undefined;
		const social = select( SOCIAL_STORE ) as
			| {
					getConnections: () => Connection[];
					isSharingCurrentPost: () => boolean;
			  }
			| undefined;

		const connections = social?.getConnections?.() ?? [];
		const enabledConnections = connections.filter( ( c ) => c.enabled !== false );

		return {
			currentVideoUrl: videoStore.getCurrentVideoUrl?.() ?? null,
			currentAttachmentId: videoStore.getCurrentAttachmentId?.() ?? null,
			currentDurationSeconds: videoStore.getCurrentDurationSeconds?.() ?? null,
			entryPoint: studio.getEntryPoint?.() ?? null,
			isPublished: editor?.isCurrentPostPublished?.() ?? false,
			currentMeta:
				( editor?.getEditedPostAttribute?.( 'meta' ) as Record< string, unknown > ) ?? {},
			hasInstagramConnection: enabledConnections.some( ( c ) => c.service_name === IG_SERVICE ),
			nonInstagramConnectionIds: enabledConnections
				.filter( ( c ) => c.service_name !== IG_SERVICE )
				.map( ( c ) => String( c.connection_id ) ),
			isSharing: social?.isSharingCurrentPost?.() ?? false,
		};
	}, [] );

	const { editPost } = useDispatch( EDITOR_STORE ) as {
		editPost: ( edits: { meta: Record< string, unknown > } ) => Promise< void >;
	};
	const { shareCurrentPost } = useDispatch( SOCIAL_STORE ) as {
		shareCurrentPost: (
			params: { message: string; skipped_connections: string[] },
			config: { apiPath: string; savePost?: boolean }
		) => Promise< boolean >;
	};
	const { addNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const isVisible =
		entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip &&
		!! currentVideoUrl &&
		!! sharePath;

	let reason: ReelShareReason | null = null;
	if ( ! currentVideoUrl || ! currentAttachmentId ) {
		reason = 'no-video';
	} else if ( ! sharePath ) {
		reason = 'no-script-data';
	} else if ( ! hasInstagramConnection ) {
		reason = 'no-connection';
	} else if ( ! isPublished ) {
		reason = 'post-not-published';
	}
	const canShare = reason === null;

	const handleShare = useCallback( async () => {
		trackImageStudioReelShareClicked( {
			attachmentId: currentAttachmentId ?? 0,
			durationSeconds: currentDurationSeconds,
		} );

		// Pre-check guards on closure-captured values from the latest render.
		// useSelect re-renders on store changes, so by click time these reflect
		// the most recent store state. Defensive against the rare case where
		// isVisible let the button render but state shifted before the click.
		if ( ! currentVideoUrl || ! currentAttachmentId ) {
			trackImageStudioReelShareInvalidState();
			await addNotice(
				__( 'Generate a video first to share it as a Reel.', __i18n_text_domain__ ),
				'error'
			);
			return;
		}

		if ( ! sharePath ) {
			// isVisible would be false in this case; defensive bail-out.
			return;
		}

		if ( ! hasInstagramConnection ) {
			trackImageStudioReelShareNotConnected();
			await addNotice(
				__(
					'Connect Instagram in your site marketing settings to share Reels.',
					__i18n_text_domain__
				),
				'warning',
				[
					{
						label: __( 'Connect Instagram', __i18n_text_domain__ ),
						url: getConnectInstagramUrl(),
						openInNewTab: true,
					},
				]
			);
			return;
		}

		if ( ! isPublished ) {
			trackImageStudioReelShareNotPublished();
			await addNotice(
				__( 'Publish this post first to share it as an Instagram Reel.', __i18n_text_domain__ ),
				'warning'
			);
			return;
		}

		const existingSocialOptions =
			( currentMeta.jetpack_social_options as JetpackSocialOptions | undefined ) ?? {};

		try {
			await editPost( {
				meta: {
					jetpack_social_options: {
						...existingSocialOptions,
						attached_media: [
							{
								id: currentAttachmentId,
								url: currentVideoUrl,
								type: 'video/mp4',
							},
						],
						media_source: 'upload-video',
					},
				},
			} );

			const success = await shareCurrentPost(
				{ message: '', skipped_connections: nonInstagramConnectionIds },
				{ savePost: true, apiPath: sharePath }
			);

			if ( success ) {
				trackImageStudioReelShareDispatched();
				await addNotice( __( 'Shared to Instagram as a Reel.', __i18n_text_domain__ ), 'success' );
			} else {
				// shareCurrentPost already created a notice via @wordpress/notices;
				// avoid a second one. Just record telemetry.
				trackImageStudioReelShareFailed();
			}
		} catch ( err ) {
			const message = err instanceof Error ? err.message : undefined;
			trackImageStudioReelShareFailed( message );
		}
	}, [
		addNotice,
		currentAttachmentId,
		currentDurationSeconds,
		currentMeta,
		currentVideoUrl,
		editPost,
		hasInstagramConnection,
		isPublished,
		nonInstagramConnectionIds,
		sharePath,
		shareCurrentPost,
	] );

	return {
		canShare,
		reason,
		isVisible,
		isSharing,
		handleShare,
	};
}
