import { ImageStudioEntryPoint } from '../store';
import { getThemeFeaturedImageAspectRatio } from './theme-aspect-ratio';

// Featured images are shown wide and shared as wide link previews, so they start landscape.
const LANDSCAPE_ENTRY_POINTS: Array< string | null > = [
	ImageStudioEntryPoint.JetpackAIFeaturedImage,
	ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage,
];

/**
 * The aspect ratio a session starts with when the user has not picked one.
 * @param entryPoint - The surface that opened Image Studio.
 * @param select - The data registry's `select`, used to read the theme's featured image ratio.
 * @returns The ratio, or null to let the model decide.
 */
export function getDefaultAspectRatio(
	entryPoint: string | null,
	select: ( storeName: string ) => unknown
): string | null {
	if ( ! LANDSCAPE_ENTRY_POINTS.includes( entryPoint ) ) {
		return null;
	}
	return getThemeFeaturedImageAspectRatio( select ) ?? '16:9';
}
