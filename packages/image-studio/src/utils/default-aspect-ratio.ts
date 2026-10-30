import { ImageStudioEntryPoint } from '../store';

// Featured images are shown wide and shared as wide link previews, so they start landscape.
const LANDSCAPE_ENTRY_POINTS: Array< string | null > = [
	ImageStudioEntryPoint.JetpackAIFeaturedImage,
	ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage,
];

/**
 * The aspect ratio a session starts with when the user has not picked one.
 * @param entryPoint - The surface that opened Image Studio.
 * @returns The ratio, or null to let the model decide.
 */
export function getDefaultAspectRatio( entryPoint: string | null ): string | null {
	return LANDSCAPE_ENTRY_POINTS.includes( entryPoint ) ? '16:9' : null;
}
