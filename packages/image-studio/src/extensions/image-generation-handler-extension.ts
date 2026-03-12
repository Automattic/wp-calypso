import { dispatch } from '@wordpress/data';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { type ImageData } from '../utils/get-image-data';
import { trackImageStudioOpened } from '../utils/tracking';

/**
 * Known Jetpack AI surfaces that can open Image Studio.
 * Add new surfaces here as they are implemented on the Jetpack side.
 */
type JetpackAISurface = 'featured-image' | 'social-media';

/**
 * Map Jetpack surface entry points to Image Studio entry points for tracking.
 * These are distinct from JetpackExternalMedia* entry points which come from
 * the external media modal. These JetpackAI* entry points track usage from
 * the jetpack.ai.imageGenerationHandler filter (AI sidebar, social media UI).
 */
const ENTRY_POINT_MAP: Record< JetpackAISurface, ImageStudioEntryPoint > = {
	'featured-image': ImageStudioEntryPoint.JetpackAIFeaturedImage,
	'social-media': ImageStudioEntryPoint.JetpackAISocialMedia,
};

/**
 * Type guard to check if an entry point string is a known Jetpack AI surface.
 * @param value - The entry point string to check.
 * @returns Whether the value is a known Jetpack AI surface.
 */
const isKnownSurface = ( value: string ): value is JetpackAISurface =>
	Object.prototype.hasOwnProperty.call( ENTRY_POINT_MAP, value );
/**
 * Unified filter callback for `jetpack.ai.imageGenerationHandler`.
 *
 * Returns a click handler that opens Image Studio in generate mode.
 * Works for all Jetpack surfaces — the `entryPoint` field in context
 * determines tracking metadata. The `onImageSelect` callback abstracts
 * away surface-specific image handling (e.g. setting featured image vs
 * updating social media attachments).
 * @param _defaultHandler       - The default handler value (null when no plugin hooks the filter).
 * @param context               - Context about the current Jetpack surface.
 * @param context.entryPoint    - Which surface is calling: 'featured-image' | 'social-media'.
 * @param context.onImageSelect - Callback to deliver the selected image back to the Jetpack surface.
 * @param context.extra         - Optional surface-specific metadata (placement, disabled, etc.).
 * @returns A click handler that opens Image Studio, or the default handler if context is invalid.
 */
export const addImageStudioHandler = (
	_defaultHandler: null,
	context: {
		entryPoint: string;
		onImageSelect: ( image: { id: number; url: string; mime?: string } ) => void;
		extra?: Record< string, unknown >;
	}
): ( () => void ) | null => {
	if ( ! context || typeof context.onImageSelect !== 'function' ) {
		return _defaultHandler;
	}

	const { entryPoint, onImageSelect } = context;

	const studioEntryPoint = isKnownSurface( entryPoint )
		? ENTRY_POINT_MAP[ entryPoint ]
		: ImageStudioEntryPoint.EditorSidebar;

	return () => {
		trackImageStudioOpened( {
			mode: ImageStudioMode.Generate,
			attachmentId: undefined,
			entryPoint: studioEntryPoint,
		} );

		dispatch( imageStudioStore ).openImageStudio(
			undefined, // Generate mode (no existing attachment)
			( image: ImageData | null ) => {
				if ( image?.id && image?.url ) {
					onImageSelect( {
						id: image.id,
						url: image.url,
					} );
				}
			},
			studioEntryPoint
		);
	};
};
