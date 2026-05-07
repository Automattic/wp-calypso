import { select as freshSelect, useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	ImageStudioEntryPoint,
	store as imageStudioStore,
	type ImageStudioActions,
} from '../../store';
import { store as videoStudioStore } from '../../stores/video-studio';
import { getJetpackAdminUrl, getReelSharePostPath } from '../../utils/jetpack-script-data';
import {
	trackImageStudioReelShareClicked,
	trackImageStudioReelShareConnectionDisabled,
	trackImageStudioReelShareDispatched,
	trackImageStudioReelShareFailed,
	trackImageStudioReelShareInvalidState,
	trackImageStudioReelShareNotConnected,
	trackImageStudioReelShareNotPublished,
} from '../../utils/tracking';

const SOCIAL_STORE = 'jetpack-social-plugin';
const EDITOR_STORE = 'core/editor';
const IG_SERVICE = 'instagram-business';

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
		currentMeta,
		isSharing,
	} = useSelect( ( select ) => {
		const videoStore = select( videoStudioStore );
		const studio = select( imageStudioStore );
		const editor = select( EDITOR_STORE ) as
			| { getEditedPostAttribute: ( attr: string ) => unknown }
			| undefined;
		const social = select( SOCIAL_STORE ) as { isSharingCurrentPost: () => boolean } | undefined;

		return {
			currentVideoUrl: videoStore.getCurrentVideoUrl?.() ?? null,
			currentAttachmentId: videoStore.getCurrentAttachmentId?.() ?? null,
			currentDurationSeconds: videoStore.getCurrentDurationSeconds?.() ?? null,
			entryPoint: studio.getEntryPoint?.() ?? null,
			isAiProcessing: studio.getImageStudioAiProcessing?.() ?? false,
			currentMeta:
				( editor?.getEditedPostAttribute?.( 'meta' ) as Record< string, unknown > ) ?? {},
			isSharing: social?.isSharingCurrentPost?.() ?? false,
		};
	}, [] );

	const { editPost } = useDispatch( EDITOR_STORE ) as {
		editPost: ( edits: { meta: Record< string, unknown > } ) => void;
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
		const freshIgConnection = freshConnections.find( ( c ) => c.service_name === IG_SERVICE );
		const freshIgIsEnabled = !! freshIgConnection && freshIgConnection.enabled !== false;
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

		if ( ! freshIgConnection ) {
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
						url: getJetpackAdminUrl( 'admin.php?page=jetpack-social' ),
						openInNewTab: true,
					},
				],
				true
			);
			return;
		}

		if ( ! freshIgIsEnabled ) {
			trackImageStudioReelShareConnectionDisabled();
			await addNotice(
				__(
					'Instagram sharing is not enabled for this post. Enable it in the Jetpack Social sidebar to share this Reel.',
					__i18n_text_domain__
				),
				'warning',
				undefined,
				true
			);
			return;
		}

		if ( ! freshIsPublished ) {
			trackImageStudioReelShareNotPublished();
			await addNotice(
				__( 'Publish this post first to share it as an Instagram Reel.', __i18n_text_domain__ ),
				'warning',
				undefined,
				true
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
			editPost( {
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
				await addNotice(
					__(
						'Reel shared to Instagram. It may take a few minutes to appear on your account.',
						__i18n_text_domain__
					),
					'success'
				);
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
		isVisible,
		isSharing,
		handleShare,
	};
}
