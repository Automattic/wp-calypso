import { useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { type Suggestion } from '@automattic/agenttic-client';
import { ImageStudioMode } from '../types';
import {
	formatSuggestionIds,
	trackImageStudioSuggestionClick,
	trackImageStudioSuggestionsRendered,
} from '../utils/tracking';
import { store as imageStudioStore } from '../store';
/**
 * Registers default image editing suggestions with the agent,
 * and clears them after the first user message.
 *
 * @param {Function}        registerSuggestions - Function to register suggestions.
 * @param {Function}        clearSuggestions    - Function to clear suggestions.
 * @param {Array}           messages            - Array of messages from agent chat.
 * @param {ImageStudioMode} mode                - Image studio mode (edit or generate).
 */
export function useImageStudioSuggestions(
	registerSuggestions?: Function,
	clearSuggestions?: Function,
	messages?: any[],
	mode?: ImageStudioMode
) {
	const {
		hasAnnotations,
		clearAnnotations,
		isAiProcessing,
		isAnnotationSaving,
		isCurrentAttachmentAnnotated,
		isAnnotationMode,
	} = useSelect( ( select ) => {
		const selectors = select( imageStudioStore ) as any;
		const annotationCanvasRef = selectors.getAnnotationCanvasRef();
		const currentAttachmentId = selectors.getImageStudioAttachmentId();
		const annotatedAttachmentIds = selectors.getAnnotatedAttachmentIds() || [];

		return {
			hasAnnotations: annotationCanvasRef?.hasAnnotations?.() ?? false,
			clearAnnotations: annotationCanvasRef?.clear,
			isAiProcessing: selectors.getImageStudioAiProcessing(),
			isAnnotationSaving: selectors.getIsAnnotationSaving(),
			isAnnotationMode: selectors.getIsAnnotationMode(),
			isCurrentAttachmentAnnotated:
				currentAttachmentId && annotatedAttachmentIds.includes( currentAttachmentId ),
		};
	}, [] );

	const { setAnnotationMode } = useDispatch( imageStudioStore );

	const registerSuggestionsAndTrack = useCallback(
		( suggestions: Suggestion[], suggestionType: 'default' | 'annotation' = 'default' ) => {
			registerSuggestions?.( suggestions );
			trackImageStudioSuggestionsRendered( {
				suggestions: formatSuggestionIds( suggestions ),
				mode: mode || ImageStudioMode.Edit,
				suggestionType,
			} );
		},
		[ registerSuggestions, mode ]
	);

	useEffect( () => {
		const defaultEditSuggestions: Suggestion[] = [
			{
				id: 'enhance-image',
				label: __( 'Enhance image', 'default' ),
				prompt: __(
					'Enhance this image with balanced lighting, sharpness, and color while keeping it natural',
					'default'
				),
			},
			{
				id: 'brighten-image',
				label: __( 'Brighten image', 'default' ),
				prompt: __(
					'Increase the overall brightness of this image while keeping it natural',
					'default'
				),
			},
		];

		// If no annotation has been saved, add the annotate image suggestion
		if ( ! isCurrentAttachmentAnnotated ) {
			defaultEditSuggestions.unshift( {
				id: 'annotate-image',
				label: __( 'Draw annotation', 'default' ),
				action: () => {
					setAnnotationMode( true );
					return true;
				},
			} );
		}

		const defaultGenerateSuggestions: Suggestion[] = [
			{
				id: 'generate-image-a',
				label: __( 'Cozy cafe scene', 'default' ),
				prompt: __(
					'A warm and inviting cafe scene with coffee, pastries, and natural lighting',
					'default'
				),
			},
			{
				id: 'generate-image-b',
				label: __( 'Mountain landscape', 'default' ),
				prompt: __( 'A serene mountain landscape at sunrise with misty valleys', 'default' ),
			},
			{
				id: 'generate-image-c',
				label: __( 'Professional workspace', 'default' ),
				prompt: __( 'A professional workspace scene with natural lighting', 'default' ),
			},
		];

		const defaultSuggestions: Suggestion[] =
			mode === ImageStudioMode.Edit ? defaultEditSuggestions : defaultGenerateSuggestions;

		// Show annotation suggestions
		if ( hasAnnotations && ! isAiProcessing && ! isAnnotationSaving ) {
			const annotationSuggestions: Suggestion[] = [
				{
					id: 'replace-annotated',
					label: __( 'Replace this', 'default' ),
					prompt: __( 'Replace only the region marked by the blue annotation with:', 'default' ),
				},
				{
					id: 'remove-annotated',
					label: __( 'Remove this', 'default' ),
					prompt: __(
						'Remove only the region marked by the blue annotation. Do not change anything else',
						'default'
					),
				},
				{
					id: 'enhance-annotated',
					label: __( 'Enhance this', 'default' ),
					prompt: __(
						'Enhance only the region marked by the blue annotation. Preserve everything else unchanged.',
						'default'
					),
				},
			];

			registerSuggestionsAndTrack( annotationSuggestions, 'annotation' );
			return;
		}

		// If there are messages and no annotations, clear suggestions
		if ( messages?.length && ! hasAnnotations ) {
			clearSuggestions?.();
			return;
		}

		// Show default suggestions
		if ( ! isAiProcessing && ! hasAnnotations && ! isAnnotationMode ) {
			registerSuggestionsAndTrack( defaultSuggestions );
			return;
		}

		registerSuggestions?.( [] );
	}, [
		mode,
		isAiProcessing,
		registerSuggestionsAndTrack,
		registerSuggestions,
		isAnnotationSaving,
		clearSuggestions,
		hasAnnotations,
		clearAnnotations,
		isAnnotationMode,
		setAnnotationMode,
		isCurrentAttachmentAnnotated,
		messages,
	] );

	const handleSuggestionClick = ( selectedSuggestion: any, availableSuggestions: any[] ) => {
		trackImageStudioSuggestionClick( {
			suggestionId: selectedSuggestion.id || '',
			suggestionText: selectedSuggestion.prompt || '',
			availableSuggestions: formatSuggestionIds( availableSuggestions ),
			mode: mode || ImageStudioMode.Edit,
		} );
	};

	return { handleSuggestionClick };
}
