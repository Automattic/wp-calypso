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
import type { ShareClipIdentity } from '../share-types';

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

export function useReelShare( clip?: ShareClipIdentity ): UseReelShareReturn {
	const sharePath = getReelSharePostPath();
	const hasOverride = clip !== undefined;

	const {
		storeUrl,
		storeAttachmentId,
		storeDuration,
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
			storeUrl: videoStore.getCurrentVideoUrl?.() ?? null,
			storeAttachmentId: videoStore.getCurrentAttachmentId?.() ?? null,
			storeDuration: videoStore.getCurrentDurationSeconds?.() ?? null,
			entryPoint: studio.getEntryPoint?.() ?? null,
			isAiProcessing: studio.getImageStudioAiProcessing?.() ?? false,
			currentMeta:
				( editor?.getEditedPostAttribute?.( 'meta' ) as Record< string, unknown > ) ?? {},
			isSharing: social?.isSharingCurrentPost?.() ?? false,
		};
	}, [] );

	const currentVideoUrl = hasOverride ? clip.url : storeUrl;
	const currentAttachmentId = hasOverride ? clip.attachmentId : storeAttachmentId;
	const currentDurationSeconds = hasOverride ? clip.durationSeconds ?? null : storeDuration;

	const { editPost } = useDispatch( EDITOR_STORE ) as {
		editPost: ( edits: { meta: Record< string, unknown > } ) => void;
	};
	const { shareCurrentPost } = useDispatch( SOCIAL_STORE ) as {
		shareCurrentPost: (
			params: { message: string; skipped_connections: string[] },
			config: { apiPath: string; savePost?: boolean }
		) => Promise< boolean >;
	};
	const { addNotice: addModalNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;
	const { createNotice: createCoreNotice } = useDispatch( 'core/notices' ) as {
		createNotice?: (
			status: string,
			message: string,
			options?: {
				type?: 'default' | 'snackbar';
				isDismissible?: boolean;
				actions?: Array< { label: string; url?: string; onClick?: () => void } >;
			}
		) => Promise< void >;
	};

	/**
	 * Route notices to the surface that's actually visible right now. The
	 * imageStudioStore notice list only renders inside the open Image Studio
	 * modal; from the sidebar the modal isn't on screen, so notices need to
	 * land on the editor's `core/notices` snackbar instead. We use the
	 * presence of the clip override as the heuristic — only the sidebar
	 * supplies one today.
	 */
	const showNotice = async (
		message: string,
		type: 'success' | 'warning' | 'error',
		actions?: Array< { label: string; url: string; openInNewTab?: boolean } >,
		isDismissible?: boolean
	) => {
		if ( hasOverride ) {
			await createCoreNotice?.( type, message, {
				type: 'snackbar',
				// Match imageStudioStore.addNotice's default (dismissible) when
				// the caller doesn't say otherwise — coercing undefined to false
				// would silently lose the user's ability to dismiss.
				isDismissible: isDismissible ?? true,
				// Honour `openInNewTab` by routing through an onClick that opens
				// in a new tab, instead of the default same-tab navigation a
				// bare `url` action triggers. Same-tab navigation away from the
				// editor would discard any unsaved post edits.
				actions: actions?.map( ( a ) =>
					a.openInNewTab
						? { label: a.label, onClick: () => window.open( a.url, '_blank', 'noopener' ) }
						: { label: a.label, url: a.url }
				),
			} );
			return;
		}
		// Forward only the args that were supplied so call sites that don't
		// pass actions/isDismissible aren't surprised by trailing undefineds.
		if ( isDismissible !== undefined ) {
			await addModalNotice( message, type, actions, isDismissible );
		} else if ( actions !== undefined ) {
			await addModalNotice( message, type, actions );
		} else {
			await addModalNotice( message, type );
		}
	};

	// Synchronous guard against double-clicks — `isSharing` from useSelect lags
	// the first dispatch by a render, so we can't rely on `disabled` alone.
	const isSharingRef = useRef( false );

	// When the caller supplies an explicit clip (e.g. the sidebar reading meta),
	// it has already asserted the video context — the entryPoint guard is only
	// meaningful for the in-modal call site that reads the live store.
	const isVideoContext = hasOverride || entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip;
	const isVisible =
		isVideoContext &&
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
			await showNotice(
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
			await showNotice(
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
			await showNotice(
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
			await showNotice(
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
				await showNotice(
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
		showNotice,
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
