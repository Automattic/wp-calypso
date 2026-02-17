import { type Suggestion } from '@automattic/agenttic-client';
import { __ } from '@wordpress/i18n';
import { ImageStudioMode } from '../types';

/**
 * Static edit mode suggestions (enhance, brighten).
 */
export const EDIT_SUGGESTIONS: Suggestion[] = [
	{
		id: 'enhance-image',
		label: __( 'Enhance image', 'big-sky' ),
		prompt: __(
			'Enhance this image with balanced lighting, sharpness, and color while keeping it natural',
			'big-sky'
		),
	},
	{
		id: 'brighten-image',
		label: __( 'Brighten image', 'big-sky' ),
		prompt: __(
			'Increase the overall brightness of this image while keeping it natural',
			'big-sky'
		),
	},
];

/**
 * Default generate mode suggestions for non-block-editor contexts.
 */
export const DEFAULT_GENERATE_SUGGESTIONS: Suggestion[] = [
	{
		id: 'generate-image-a',
		label: __( 'Cozy cafe scene', 'big-sky' ),
		prompt: __(
			'A warm and inviting cafe scene with coffee, pastries, and natural lighting',
			'big-sky'
		),
	},
	{
		id: 'generate-image-b',
		label: __( 'Mountain landscape', 'big-sky' ),
		prompt: __( 'A serene mountain landscape at sunrise with misty valleys', 'big-sky' ),
	},
	{
		id: 'generate-image-c',
		label: __( 'Professional workspace', 'big-sky' ),
		prompt: __( 'A professional workspace scene with natural lighting', 'big-sky' ),
	},
];

/**
 * Annotation mode suggestions.
 */
export const ANNOTATION_SUGGESTIONS: Suggestion[] = [
	{
		id: 'replace-annotated',
		label: __( 'Replace this', 'big-sky' ),
		prompt: __( 'Replace only the region marked by the blue annotation with:', 'big-sky' ),
	},
	{
		id: 'remove-annotated',
		label: __( 'Remove this', 'big-sky' ),
		prompt: __(
			'Remove only the region marked by the blue annotation. Do not change anything else',
			'big-sky'
		),
	},
	{
		id: 'enhance-annotated',
		label: __( 'Enhance this', 'big-sky' ),
		prompt: __(
			'Enhance only the region marked by the blue annotation. Preserve everything else unchanged.',
			'big-sky'
		),
	},
];

export interface SuggestionState {
	hasAnnotations: boolean;
	isAiProcessing: boolean;
	isAnnotationSaving: boolean;
	isAnnotationMode: boolean;
	isCurrentAttachmentAnnotated: boolean;
}

export interface SuggestionContext extends SuggestionState {
	mode: ImageStudioMode | undefined;
	hasMessages: boolean;
	// Whether async suggestions loading is available for this context.
	supportsAsyncSuggestions: boolean;
	setAnnotationMode: ( mode: boolean ) => void;
}

export interface SuggestionResult {
	type: 'annotation' | 'clear' | 'empty' | 'edit' | 'generate';
	suggestions: Suggestion[];
}

/**
 * Creates the annotate image suggestion with an action callback.
 * @param onAnnotate - Callback to set annotation mode to true.
 * @returns The annotate image suggestion.
 */
function createAnnotateSuggestion( onAnnotate: () => void ): Suggestion {
	return {
		id: 'annotate-image',
		label: __( 'Draw annotation', 'big-sky' ),
		action: () => {
			onAnnotate();
			return true;
		},
	};
}

/**
 * Builds edit mode suggestions, optionally including the annotate action.
 * @param isCurrentAttachmentAnnotated - Whether the current attachment is annotated.
 * @param setAnnotationMode            - Callback to set annotation mode to true.
 * @returns The edit mode suggestions.
 */
function buildEditSuggestions(
	isCurrentAttachmentAnnotated: boolean,
	setAnnotationMode: ( mode: boolean ) => void
): Suggestion[] {
	if ( isCurrentAttachmentAnnotated ) {
		return EDIT_SUGGESTIONS;
	}

	return [ createAnnotateSuggestion( () => setAnnotationMode( true ) ), ...EDIT_SUGGESTIONS ];
}

/**
 * Gets generate mode suggestions for non-async contexts.
 * @param supportsAsyncSuggestions - Whether async suggestions are supported.
 * @returns The default generate mode suggestions, or empty if async is supported.
 */
function getGenerateSuggestions( supportsAsyncSuggestions: boolean ): Suggestion[] {
	// Async contexts will load suggestions via the loader
	if ( supportsAsyncSuggestions ) {
		return [];
	}
	return DEFAULT_GENERATE_SUGGESTIONS;
}

export function getSuggestions( context: SuggestionContext ): SuggestionResult {
	const {
		mode,
		hasAnnotations,
		isAiProcessing,
		isAnnotationSaving,
		isAnnotationMode,
		isCurrentAttachmentAnnotated,
		hasMessages,
		supportsAsyncSuggestions,
		setAnnotationMode,
	} = context;

	// Priority 1: Show annotation suggestions when annotations are present
	if ( hasAnnotations && ! isAiProcessing && ! isAnnotationSaving ) {
		return {
			type: 'annotation',
			suggestions: ANNOTATION_SUGGESTIONS,
		};
	}

	// Priority 2: Clear suggestions after first user message
	if ( hasMessages && ! hasAnnotations ) {
		return {
			type: 'clear',
			suggestions: [],
		};
	}

	// Priority 3: Don't show suggestions while processing or in annotation mode
	if ( isAiProcessing || hasAnnotations || isAnnotationMode ) {
		return {
			type: 'empty',
			suggestions: [],
		};
	}

	// Priority 4: Mode-specific suggestions
	if ( mode === ImageStudioMode.Generate ) {
		return {
			type: 'generate',
			suggestions: getGenerateSuggestions( supportsAsyncSuggestions ),
		};
	}

	// Default: Edit mode suggestions
	return {
		type: 'edit',
		suggestions: buildEditSuggestions( isCurrentAttachmentAnnotated, setAnnotationMode ),
	};
}
