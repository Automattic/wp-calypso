import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore, type ImageStudioActions } from '../../store';
import { ImageStudioEntryPoint } from '../../store';
import { store as videoStudioStore } from '../../stores/video-studio';
import {
	trackImageStudioGenericShareClicked,
	trackImageStudioGenericShareCompleted,
	trackImageStudioGenericShareFailed,
} from '../../utils/tracking';

interface UseGenericShareReturn {
	isVisible: boolean;
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

export function useGenericShare(): UseGenericShareReturn {
	const { currentVideoUrl, currentAttachmentId, entryPoint, isAiProcessing } = useSelect(
		( select ) => {
			const videoStore = select( videoStudioStore );
			const studio = select( imageStudioStore );
			return {
				currentVideoUrl: videoStore.getCurrentVideoUrl?.() ?? null,
				currentAttachmentId: videoStore.getCurrentAttachmentId?.() ?? null,
				entryPoint: studio.getEntryPoint?.() ?? null,
				isAiProcessing: studio.getImageStudioAiProcessing?.() ?? false,
			};
		},
		[]
	);

	const { addNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;

	// Synchronous double-click guard — same rationale as in useReelShare.
	const isSharingRef = useRef( false );

	const isVisible =
		entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip &&
		!! currentVideoUrl &&
		!! currentAttachmentId &&
		! isAiProcessing;

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
		try {
			// Fire the clicked event at the start of every method we attempt
			// (web-share, web-share-unsupported, download), not after the work
			// succeeds. Otherwise a fetch failure or canShare-rejects-files
			// emits a `failed` event with no matching `clicked` and the funnel
			// doesn't add up.
			//
			// Probe before fetching — saves a full MP4 download on browsers
			// that expose navigator.share but reject files (most desktops).
			if ( nav && canShareVideoFiles( nav, filename ) ) {
				trackImageStudioGenericShareClicked( { method: 'web-share' } );
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
					} );
					trackImageStudioGenericShareCompleted( { method: 'web-share' } );
					return;
				} catch ( err ) {
					if ( err instanceof DOMException && err.name === 'AbortError' ) {
						// User cancelled the share sheet — silent, no notice, no fallback.
						return;
					}
					const message = err instanceof Error ? err.message : '';
					const failureKind =
						err instanceof Error && err.message.startsWith( 'Fetch failed:' ) ? 'http' : undefined;
					trackImageStudioGenericShareFailed( {
						method: 'web-share',
						...( failureKind ? { failureKind } : {} ),
						message,
					} );
					// Fall through to download.
				}
			} else if ( nav && typeof nav.share === 'function' ) {
				// Web Share API exists but doesn't accept video files — record this
				// case so we can see how often it happens vs. a clean download path.
				trackImageStudioGenericShareClicked( { method: 'web-share-unsupported' } );
				trackImageStudioGenericShareFailed( { method: 'web-share-unsupported' } );
			}

			// Fallback: open the MP4 URL in a new tab so the browser can save it.
			trackImageStudioGenericShareClicked( { method: 'download' } );
			const opened = window.open( currentVideoUrl, '_blank', 'noopener' );
			if ( opened ) {
				trackImageStudioGenericShareCompleted( { method: 'download' } );
				return;
			}
			trackImageStudioGenericShareFailed( {
				method: 'download',
				failureKind: 'open-blocked',
				message: 'window.open returned null',
			} );
			await addNotice(
				__(
					'Could not open the video for download. Allow popups for this site and try again.',
					__i18n_text_domain__
				),
				'error'
			);
		} finally {
			isSharingRef.current = false;
		}
	}, [ addNotice, currentAttachmentId, currentVideoUrl ] );

	return {
		isVisible,
		handleShare,
	};
}
