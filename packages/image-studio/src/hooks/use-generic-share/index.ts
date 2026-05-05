import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
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

type ShareMethod = 'web-share' | 'download';

interface NavigatorWithShare {
	share?: ( data: { files?: File[]; title?: string; text?: string } ) => Promise< void >;
	canShare?: ( data: { files?: File[] } ) => boolean;
}

function getNavigator(): NavigatorWithShare | null {
	if ( typeof navigator === 'undefined' ) {
		return null;
	}
	return navigator as unknown as NavigatorWithShare;
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

	const isVisible =
		entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip &&
		!! currentVideoUrl &&
		!! currentAttachmentId &&
		! isAiProcessing;

	const handleShare = useCallback( async () => {
		if ( ! currentVideoUrl ) {
			return;
		}

		const filename = `clip-${ currentAttachmentId ?? Date.now() }.mp4`;
		const nav = getNavigator();
		const canTryWebShare =
			!! nav && typeof nav.share === 'function' && typeof nav.canShare === 'function';

		// Web Share API path — works on iOS Safari, Android Chrome, etc.
		if ( canTryWebShare && nav ) {
			const method: ShareMethod = 'web-share';
			try {
				const response = await fetch( currentVideoUrl );
				if ( ! response.ok ) {
					throw new Error( `Fetch failed: ${ response.status }` );
				}
				const blob = await response.blob();
				const file = new File( [ blob ], filename, { type: 'video/mp4' } );

				if ( nav.canShare && nav.canShare( { files: [ file ] } ) ) {
					trackImageStudioGenericShareClicked( { method } );
					await nav.share?.( {
						files: [ file ],
						title: __( 'Generated video clip', __i18n_text_domain__ ),
					} );
					trackImageStudioGenericShareCompleted( { method } );
					return;
				}
			} catch ( err ) {
				const isAbort = err instanceof DOMException && err.name === 'AbortError';
				if ( isAbort ) {
					// User cancelled the share sheet — silent, no notice.
					return;
				}
				const message = err instanceof Error ? err.message : '';
				trackImageStudioGenericShareFailed( { method, message } );
				// Fall through to download.
			}
		}

		// Fallback: open the MP4 URL in a new tab so the browser can save it.
		const downloadMethod: ShareMethod = 'download';
		trackImageStudioGenericShareClicked( { method: downloadMethod } );
		const opened = window.open( currentVideoUrl, '_blank', 'noopener' );
		if ( opened ) {
			trackImageStudioGenericShareCompleted( { method: downloadMethod } );
			return;
		}
		trackImageStudioGenericShareFailed( {
			method: downloadMethod,
			message: 'window.open returned null',
		} );
		await addNotice(
			__(
				'Could not open the video for download. Allow popups for this site and try again.',
				__i18n_text_domain__
			),
			'error'
		);
	}, [ addNotice, currentAttachmentId, currentVideoUrl ] );

	return {
		isVisible,
		handleShare,
	};
}
