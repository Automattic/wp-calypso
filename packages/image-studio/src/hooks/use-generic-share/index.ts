import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore, type ImageStudioActions } from '../../store';
import { ImageStudioEntryPoint } from '../../store';
import { store as videoStudioStore } from '../../stores/video-studio';
import {
	trackImageStudioGenericShareClicked,
	trackImageStudioGenericShareCompleted,
	trackImageStudioGenericShareFailed,
} from '../../utils/tracking';
import type { ShareSurface } from '../../utils/tracking';
import type { ShareClipIdentity } from '../share-types';

interface UseGenericShareReturn {
	isVisible: boolean;
	isSharing: boolean;
	handleShare: () => Promise< void >;
}

interface NavigatorWithShare {
	share?: ( data: { files?: File[]; title?: string; text?: string } ) => Promise< void >;
	canShare?: ( data: { files?: File[] } ) => boolean;
}

/**
 * Probe whether the platform's Web Share API can accept video files at all,
 * without paying for a full video fetch first. Builds a 0-byte File with the
 * target MIME and asks `navigator.canShare`. Returns false on browsers where
 * `navigator.share` exists but doesn't support files (most desktop Chromium).
 */
function canShareVideoFiles( nav: NavigatorWithShare, filename: string ): boolean {
	if ( typeof nav.share !== 'function' || typeof nav.canShare !== 'function' ) {
		return false;
	}
	try {
		const probe = new File( [], filename, { type: 'video/mp4' } );
		return nav.canShare( { files: [ probe ] } );
	} catch {
		return false;
	}
}

export function useGenericShare(
	surface: ShareSurface,
	clip?: ShareClipIdentity
): UseGenericShareReturn {
	const hasOverride = clip !== undefined;

	const { storeUrl, storeAttachmentId, entryPoint, isAiProcessing, postPermalink } = useSelect(
		( select ) => {
			const videoStore = select( videoStudioStore );
			const studio = select( imageStudioStore );
			const editor = select( 'core/editor' ) as { getPermalink?: () => string | null } | undefined;
			return {
				storeUrl: videoStore.getCurrentVideoUrl?.() ?? null,
				storeAttachmentId: videoStore.getCurrentAttachmentId?.() ?? null,
				entryPoint: studio.getEntryPoint?.() ?? null,
				isAiProcessing: studio.getImageStudioAiProcessing?.() ?? false,
				postPermalink: editor?.getPermalink?.() ?? null,
			};
		},
		[]
	);

	const currentVideoUrl = hasOverride ? clip.url : storeUrl;
	const currentAttachmentId = hasOverride ? clip.attachmentId : storeAttachmentId;

	const { addNotice: addModalNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;
	const { createNotice: createCoreNotice } = useDispatch( 'core/notices' ) as {
		createNotice?: (
			status: string,
			message: string,
			options?: { type?: 'default' | 'snackbar'; isDismissible?: boolean }
		) => Promise< void >;
	};

	/**
	 * See `useReelShare` — same rationale. Sidebar callers (override clip) get
	 * notices on the editor snackbar; modal callers get them in-modal.
	 *
	 * Memoized so `handleShare` (which depends on it) doesn't get re-created
	 * on every render. The dispatch refs from `useDispatch` are stable, so
	 * once `hasOverride` settles `showNotice` keeps a stable identity.
	 */
	const showNotice = useCallback(
		async ( message: string, type: 'success' | 'warning' | 'error' ) => {
			if ( hasOverride ) {
				await createCoreNotice?.( type, message, {
					type: 'snackbar',
					isDismissible: true,
				} );
				return;
			}
			await addModalNotice( message, type );
		},
		[ hasOverride, createCoreNotice, addModalNotice ]
	);

	// Synchronous double-click guard — same rationale as in useReelShare.
	// Kept alongside `isSharing` state because state updates lag a render and
	// can't reliably block a fast second click on their own.
	const isSharingRef = useRef( false );
	const [ isSharing, setIsSharing ] = useState( false );

	// When the caller supplies an explicit clip, it has already asserted the
	// video context — the entryPoint guard is only meaningful for the in-modal
	// call site that reads the live store.
	const isVideoContext = hasOverride || entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip;
	const isVisible =
		isVideoContext && !! currentVideoUrl && !! currentAttachmentId && ! isAiProcessing;

	const handleShare = useCallback( async () => {
		if ( isSharingRef.current ) {
			return;
		}
		if ( ! currentVideoUrl ) {
			return;
		}

		const filename = `clip-${ currentAttachmentId ?? Date.now() }.mp4`;
		const nav: NavigatorWithShare | null =
			typeof navigator === 'undefined' ? null : ( navigator as unknown as NavigatorWithShare );

		isSharingRef.current = true;
		setIsSharing( true );
		try {
			const showShareFailedNotice = async () =>
				showNotice(
					__( 'Could not share the video. Please try again.', __i18n_text_domain__ ),
					'error'
				);

			// Sharing a video *file* is essentially a mobile / Safari capability —
			// desktop Chrome & Firefox expose navigator.share but throw when handed
			// a File. Probe before fetching so we don't pull a multi-MB MP4 just to
			// fail. When there's no file-share support, surface an error rather than
			// falling back to a download — the toolbar already has a download action.
			if ( ! nav || ! canShareVideoFiles( nav, filename ) ) {
				trackImageStudioGenericShareClicked( { surface, method: 'web-share-unsupported' } );
				trackImageStudioGenericShareFailed( { surface, method: 'web-share-unsupported' } );
				await showShareFailedNotice();
				return;
			}

			trackImageStudioGenericShareClicked( { surface, method: 'web-share' } );
			try {
				const response = await fetch( currentVideoUrl );
				if ( ! response.ok ) {
					throw new Error( `Fetch failed: ${ response.status }` );
				}
				const blob = await response.blob();
				const file = new File( [ blob ], filename, { type: 'video/mp4' } );
				await nav.share?.( {
					files: [ file ],
					title: __( 'Generated video clip', __i18n_text_domain__ ),
					...( postPermalink ? { text: postPermalink } : {} ),
				} );
				trackImageStudioGenericShareCompleted( { surface, method: 'web-share' } );
			} catch ( err ) {
				if ( err instanceof DOMException && err.name === 'AbortError' ) {
					// User dismissed the share sheet — silent, no notice.
					return;
				}
				const message = err instanceof Error ? err.message : '';
				const failureKind =
					err instanceof Error && err.message.startsWith( 'Fetch failed:' ) ? 'http' : undefined;
				trackImageStudioGenericShareFailed( {
					surface,
					method: 'web-share',
					...( failureKind ? { failureKind } : {} ),
					message,
				} );
				await showShareFailedNotice();
			}
		} finally {
			isSharingRef.current = false;
			setIsSharing( false );
		}
	}, [ showNotice, currentAttachmentId, currentVideoUrl, surface, postPermalink ] );

	return {
		isVisible,
		isSharing,
		handleShare,
	};
}
