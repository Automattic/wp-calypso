import { select as freshSelect, useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	ImageStudioEntryPoint,
	store as imageStudioStore,
	type ImageStudioActions,
} from '../../store';
import { store as videoStudioStore } from '../../stores/video-studio';
import { getConnectionsManagementUrl, getReelSharePostPath } from '../../utils/jetpack-script-data';
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
	// Index signature so unrelated keys (version, image_generator_settings, …)
	// flow through the spread untouched.
	[ key: string ]: unknown;
}

interface UseReelShareReturn {
	canShare: boolean;
	reason: ReelShareReason | null;
	isVisible: boolean;
	isSharing: boolean;
	handleShare: () => Promise< void >;
}

export function useReelShare(): UseReelShareReturn {
	const sharePath = getReelSharePostPath();

	const {
		currentVideoUrl,
		currentAttachmentId,
		currentDurationSeconds,
		entryPoint,
		isAiProcessing,
		isPublished,
		currentMeta,
		hasInstagramConnection,
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

		// Render-time read for the advisory `canShare` / `reason` output.
		// handleShare ignores these and re-reads via standalone select() at
		// click time — see the fresh* values below — to defeat useSelect's
		// stale-subscription quirk for late-registered stores.
		const connections = social?.getConnections?.() ?? [];
		const enabledConnections = connections.filter( ( c ) => c.enabled !== false );

		return {
			currentVideoUrl: videoStore.getCurrentVideoUrl?.() ?? null,
			currentAttachmentId: videoStore.getCurrentAttachmentId?.() ?? null,
			currentDurationSeconds: videoStore.getCurrentDurationSeconds?.() ?? null,
			entryPoint: studio.getEntryPoint?.() ?? null,
			isAiProcessing: studio.getImageStudioAiProcessing?.() ?? false,
			isPublished: editor?.isCurrentPostPublished?.() ?? false,
			currentMeta:
				( editor?.getEditedPostAttribute?.( 'meta' ) as Record< string, unknown > ) ?? {},
			hasInstagramConnection: enabledConnections.some( ( c ) => c.service_name === IG_SERVICE ),
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

	// Synchronous guard against double-clicks — `isSharing` from useSelect lags
	// the first dispatch by a render, so we can't rely on `disabled` alone.
	const isSharingRef = useRef( false );

	const isVisible =
		entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip &&
		!! currentVideoUrl &&
		!! currentAttachmentId &&
		!! sharePath &&
		! isAiProcessing;

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
		// Synchronous double-click guard. `isSharing` from useSelect lags by a
		// render so it can't reliably block a fast second click on its own.
		if ( isSharingRef.current ) {
			return;
		}

		trackImageStudioReelShareClicked( {
			attachmentId: currentAttachmentId ?? 0,
			durationSeconds: currentDurationSeconds,
		} );

		// Re-read the social and editor stores fresh at click time. useSelect's
		// subscription locks in at first run; if 'jetpack-social-plugin' wasn't
		// registered yet when the component mounted, useSelect won't re-fire
		// when the store registers later — leaving the closure with stale
		// `hasInstagramConnection: false` even after IG hydrates. Standalone
		// `select()` always reads the current registry state.
		const freshSocial = freshSelect( SOCIAL_STORE ) as
			| { getConnections: () => Connection[] }
			| undefined;
		const freshConnections = freshSocial?.getConnections?.() ?? [];
		const freshEnabledConnections = freshConnections.filter( ( c ) => c.enabled !== false );
		const freshHasInstagram = freshEnabledConnections.some(
			( c ) => c.service_name === IG_SERVICE
		);
		const freshSkipped = freshEnabledConnections
			.filter( ( c ) => c.service_name !== IG_SERVICE )
			.map( ( c ) => String( c.connection_id ) );

		const freshEditor = freshSelect( EDITOR_STORE ) as
			| { isCurrentPostPublished: () => boolean }
			| undefined;
		const freshIsPublished = freshEditor?.isCurrentPostPublished?.() ?? false;

		if ( ! currentVideoUrl || ! currentAttachmentId ) {
			trackImageStudioReelShareInvalidState();
			await addNotice(
				__( 'Generate a video first to share it as a Reel.', __i18n_text_domain__ ),
				'error'
			);
			return;
		}

		if ( ! sharePath ) {
			return;
		}

		if ( ! freshHasInstagram ) {
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
						url: getConnectionsManagementUrl() ?? '/marketing/connections',
						openInNewTab: true,
					},
				]
			);
			return;
		}

		if ( ! freshIsPublished ) {
			trackImageStudioReelShareNotPublished();
			await addNotice(
				__( 'Publish this post first to share it as an Instagram Reel.', __i18n_text_domain__ ),
				'warning'
			);
			return;
		}

		const existingSocialOptions =
			( currentMeta.jetpack_social_options as JetpackSocialOptions | undefined ) ?? {};

		isSharingRef.current = true;
		try {
			// Hardcoded `video/mp4` — Veo currently only outputs MP4. If a future
			// style preset ever returns webm/mov, source the MIME from a
			// video-studio selector and remove this assumption.
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

			// `savePost: true` flushes the just-written meta to the server before
			// the share fires; we depend on that ordering rather than awaiting a
			// separate save round-trip ourselves.
			const success = await shareCurrentPost(
				{ message: '', skipped_connections: freshSkipped },
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
		} finally {
			isSharingRef.current = false;
		}
	}, [
		addNotice,
		currentAttachmentId,
		currentDurationSeconds,
		currentMeta,
		currentVideoUrl,
		editPost,
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
