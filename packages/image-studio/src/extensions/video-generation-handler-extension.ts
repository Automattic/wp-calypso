import { dispatch } from '@wordpress/data';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { trackImageStudioOpened } from '../utils/tracking';

/**
 * Known Jetpack AI video generation surfaces. The string keys here must match
 * the entryPoint values that Jetpack's AI Assistant sidebar passes when
 * publishing the `jetpack.ai.videoGenerationHandler` filter.
 */
type JetpackAIVideoSurface = 'feature-clip';

const ENTRY_POINT_MAP: Record< JetpackAIVideoSurface, ImageStudioEntryPoint > = {
	'feature-clip': ImageStudioEntryPoint.JetpackAIFeatureClip,
};

const isKnownSurface = ( value: string ): value is JetpackAIVideoSurface =>
	Object.prototype.hasOwnProperty.call( ENTRY_POINT_MAP, value );

/**
 * Filter callback for `jetpack.ai.videoGenerationHandler`.
 *
 * Returns a click handler that opens Image Studio in video-generation mode
 * for the requested Jetpack AI surface. The video flow distributes its
 * result through the `image-studio/update-canvas-video` ability, so unlike
 * the image equivalent there is no `onImageSelect`-style callback to wire up
 * on the Jetpack side.
 * @param _defaultHandler   - The default handler value (null when no plugin hooks the filter).
 * @param context           - Context about the calling Jetpack surface.
 * @param context.entryPoint - Which surface is calling: 'feature-clip'.
 * @param context.extra     - Optional surface-specific metadata (placement, disabled, etc.).
 * @returns A click handler that opens Image Studio in video mode, or the default handler if the surface is unknown.
 */
export const addVideoStudioHandler = (
	_defaultHandler: null,
	context: {
		entryPoint: string;
		extra?: Record< string, unknown >;
	}
): ( () => void ) | null => {
	if ( ! context || ! isKnownSurface( context.entryPoint ) ) {
		return _defaultHandler;
	}

	const studioEntryPoint = ENTRY_POINT_MAP[ context.entryPoint ];

	return () => {
		trackImageStudioOpened( {
			mode: ImageStudioMode.Generate,
			attachmentId: undefined,
			entryPoint: studioEntryPoint,
		} );

		dispatch( imageStudioStore ).openImageStudio( undefined, undefined, studioEntryPoint );
	};
};
