/**
 * Image Studio Tracking Functions
 *
 * Centralized tracking functions for Image Studio events.
 * Adapted from big-sky-plugin for wp-calypso using calypso-analytics.
 */

import { recordTracksEvent as recordTracksEventBase } from '@automattic/calypso-analytics';
import { select } from '@wordpress/data';
import { store as imageStudioStore, type ImageStudioEntryPoint } from '../store';
import { getSessionId } from '../utils/session';
import type { ImageStudioMode, MetadataField } from '../types';

const TRACKS_PREFIX = 'jetpack_big_sky';

/**
 * Format suggestion IDs into a pipe-delimited string for tracking
 * @param suggestions - Array of suggestions with id property
 * @returns Pipe-delimited string of suggestion IDs
 */
export function formatSuggestionIds( suggestions: Array< { id?: string } > ): string {
	return suggestions
		.map( ( s ) => s.id || '' )
		.filter( Boolean )
		.join( '|' );
}

/**
 * Get Image Studio entry point from the store
 * @returns The entry point where Image Studio was opened from
 */
function getImageStudioEntryPoint(): string | null {
	try {
		const imageStudioStoreData = select( imageStudioStore );
		if ( imageStudioStoreData && imageStudioStoreData.getEntryPoint ) {
			return imageStudioStoreData.getEntryPoint();
		}
	} catch ( error ) {
		// Store may not be registered yet
	}
	return null;
}

/**
 * Record a tracks event with the Big Sky prefix
 * @param eventName  - The event name to track
 * @param properties - Additional properties to include
 */
function recordTracksEvent(
	eventName: string,
	properties: Record< string, string | number | boolean > = {}
): void {
	recordTracksEventBase( `${ TRACKS_PREFIX }_${ eventName }`, properties );
}

/**
 * Wrapper function to record Image Studio tracking events with entry point automatically included
 * @param eventName  - The event name to track
 * @param properties - Additional properties to include
 */
function recordImageStudioEvent(
	eventName: string,
	properties: Record< string, string | number | boolean > = {}
): void {
	const entryPoint = getImageStudioEntryPoint();
	const baseProps: Record< string, string | number | boolean > = {
		...properties,
		sessionId: getSessionId(),
	};

	if ( entryPoint ) {
		baseProps.placement = entryPoint;
	}

	// Add WordPress page context if available
	const win = window as any;
	if ( win.pagenow ) {
		baseProps.screen = win.pagenow;
	}
	if ( win.typenow ) {
		baseProps.post_type = win.typenow;
	}

	recordTracksEvent( eventName, baseProps );
}

interface TrackImageStudioOpenedOptions {
	mode: ImageStudioMode;
	attachmentId?: number;
	entryPoint?: ImageStudioEntryPoint;
}

interface TrackImageStudioClosedOptions {
	mode: ImageStudioMode;
}

interface TrackImageStudioPromptSentOptions {
	mode: ImageStudioMode;
	messageLength?: number;
}

interface TrackImageStudioImageSavedOptions {
	mode: ImageStudioMode;
	attachmentId?: number;
}

interface TrackImageStudioSuggestionsRenderedOptions {
	suggestions: string; // Pipe-delimited suggestion IDs
	mode: ImageStudioMode;
	suggestionType: 'default' | 'annotation';
}

interface TrackImageStudioSuggestionClickOptions {
	suggestionId: string;
	suggestionText: string;
	availableSuggestions: string; // Pipe-delimited
	mode: ImageStudioMode;
}

interface TrackImageStudioMetadataUpdatedOptions {
	attachmentId: number;
	field: MetadataField;
}

interface TrackImageStudioGenAIButtonClickOptions {
	field: MetadataField;
	attachmentId?: number;
}

interface TrackImageStudioAnnotationOptions {
	attachmentId?: number;
	hasAnnotations: boolean;
}

interface TrackImageStudioImageGeneratedOptions {
	mode: ImageStudioMode;
	attachmentId?: number;
	isAnnotated: boolean;
}

interface TrackImageStudioErrorOptions {
	mode: ImageStudioMode;
	errorType:
		| 'generation_failed'
		| 'edit_failed'
		| 'ability_failed'
		| 'preparation_failed'
		| 'draft_cleanup_failed'
		| 'draft_cleanup_permission_denied'
		| 'other';
	attachmentId?: number;
}

interface TrackImageStudioImageFeedbackOptions {
	feedback: 'up' | 'down';
	attachmentId: number | null;
	mode: ImageStudioMode;
}

interface TrackImageStudioFileNavigatedOptions {
	attachmentId: number;
	direction: 'previous' | 'next';
}

/**
 * Tracks when Image Studio modal is opened
 * @param options              - Tracking options
 * @param options.mode         - 'edit' or 'generate'
 * @param options.attachmentId - Attachment ID if editing existing image
 * @param options.entryPoint   - Entry point where Image Studio was opened from
 */
export function trackImageStudioOpened( {
	mode,
	attachmentId,
	entryPoint,
}: TrackImageStudioOpenedOptions ): void {
	const properties: Record< string, string | number > = { mode };
	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}
	// For the opened event, use the passed entry point since the store hasn't been updated yet
	if ( entryPoint ) {
		properties.placement = entryPoint;
	}
	// Don't use recordImageStudioEvent here since we're manually adding placement
	recordTracksEvent( 'image_studio_opened', properties );
}

/**
 * Tracks when Image Studio modal is closed
 * @param options      - Tracking options
 * @param options.mode - 'edit' or 'generate'
 */
export function trackImageStudioClosed( { mode }: TrackImageStudioClosedOptions ): void {
	recordImageStudioEvent( 'image_studio_closed', { mode } );
}

/**
 * Tracks when a toolbar tool is accessed
 * @param toolName - Name of the tool ('annotate', 'alt_text', 'media_library')
 * @param action   - Optional action ('open' or 'close') for tools that toggle
 */
export function trackImageStudioToolClick(
	toolName: 'annotate' | 'alt_text' | 'media_library',
	action?: 'open' | 'close'
): void {
	const properties: Record< string, string > = {};
	if ( action ) {
		properties.action = action;
	}
	recordImageStudioEvent( `image_studio_tool_${ toolName }_click`, properties );
}

/**
 * Tracks when the sidebar close button is clicked
 */
export function trackImageStudioSidebarClose(): void {
	recordImageStudioEvent( 'image_studio_sidebar_close' );
}

/**
 * Tracks when a prompt is sent in Image Studio
 * @param options               - Tracking options
 * @param options.mode          - 'edit' or 'generate'
 * @param options.messageLength - Length of the prompt message
 */
export function trackImageStudioPromptSent( {
	mode,
	messageLength,
}: TrackImageStudioPromptSentOptions ): void {
	const properties: Record< string, string | number > = { mode };
	if ( messageLength !== undefined ) {
		properties.message_length = messageLength;
	}
	recordImageStudioEvent( 'image_studio_prompt_sent', properties );
}

/**
 * Tracks when an image is saved from Image Studio
 * @param options              - Tracking options
 * @param options.mode         - 'edit' or 'generate'
 * @param options.attachmentId - Attachment ID if applicable
 */
export function trackImageStudioImageSaved( {
	mode,
	attachmentId,
}: TrackImageStudioImageSavedOptions ): void {
	const properties: Record< string, string | number > = { mode };
	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}
	recordImageStudioEvent( 'image_studio_image_saved', properties );
}

/**
 * Tracks when suggestions are rendered in Image Studio
 * @param options                - Tracking options
 * @param options.suggestions    - Pipe-delimited suggestion IDs
 * @param options.mode           - 'edit' or 'generate'
 * @param options.suggestionType - 'default' or 'annotation'
 */
export function trackImageStudioSuggestionsRendered( {
	suggestions,
	mode,
	suggestionType,
}: TrackImageStudioSuggestionsRenderedOptions ): void {
	recordImageStudioEvent( 'image_studio_suggestions_rendered', {
		suggestions,
		mode,
		suggestion_type: suggestionType,
	} );
}

/**
 * Tracks when a suggestion is clicked in Image Studio
 * @param options                      - Tracking options
 * @param options.suggestionId         - ID of the clicked suggestion
 * @param options.suggestionText       - Text/prompt of the clicked suggestion
 * @param options.availableSuggestions - Pipe-delimited list of available suggestions
 * @param options.mode                 - 'edit' or 'generate'
 */
export function trackImageStudioSuggestionClick( {
	suggestionId,
	suggestionText,
	availableSuggestions,
	mode,
}: TrackImageStudioSuggestionClickOptions ): void {
	recordImageStudioEvent( 'image_studio_suggestion_click', {
		suggestion_id: suggestionId,
		suggestion_text: suggestionText,
		available_suggestions: availableSuggestions,
		mode,
	} );
}

/**
 * Tracks when image metadata (caption, description, or alt text) is updated
 * @param options              - Tracking options
 * @param options.attachmentId - Attachment ID
 * @param options.field        - Which field was updated
 */
export function trackImageStudioMetadataUpdated( {
	attachmentId,
	field,
}: TrackImageStudioMetadataUpdatedOptions ): void {
	recordImageStudioEvent( 'image_studio_metadata_updated', {
		attachment_id: attachmentId,
		field,
	} );
}

/**
 * Tracks when GenAI button is clicked to regenerate metadata field
 * @param options              - Tracking options
 * @param options.field        - Which field is being regenerated
 * @param options.attachmentId - Attachment ID if available
 */
export function trackImageStudioGenAIButtonClick( {
	field,
	attachmentId,
}: TrackImageStudioGenAIButtonClickOptions ): void {
	const properties: Record< string, string | number > = { field };
	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}
	recordImageStudioEvent( 'image_studio_genai_button_click', properties );
}

/**
 * Tracks when the annotation is saved
 * @param options                - Tracking options
 * @param options.attachmentId   - Current attachment ID if available
 * @param options.hasAnnotations - Whether the canvas currently has annotations
 */
export function trackImageStudioAnnotationSave( {
	attachmentId,
	hasAnnotations,
}: TrackImageStudioAnnotationOptions ): void {
	const properties: Record< string, number | boolean > = {
		has_annotations: hasAnnotations,
	};

	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}

	recordImageStudioEvent( 'image_studio_annotation_save', properties );
}

/**
 * Tracks when the annotation is undone
 * @param options                - Tracking options
 * @param options.attachmentId   - Current attachment ID if available
 * @param options.hasAnnotations - Whether the canvas currently has annotations
 */
export function trackImageStudioAnnotationUndo( {
	attachmentId,
	hasAnnotations,
}: TrackImageStudioAnnotationOptions ): void {
	const properties: Record< string, number | boolean > = {
		has_annotations: hasAnnotations,
	};

	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}

	recordImageStudioEvent( 'image_studio_annotation_undo', properties );
}

/**
 * Tracks when the annotation is redone
 * @param options                - Tracking options
 * @param options.attachmentId   - Current attachment ID if available
 * @param options.hasAnnotations - Whether the canvas currently has annotations
 */
export function trackImageStudioAnnotationRedo( {
	attachmentId,
	hasAnnotations,
}: TrackImageStudioAnnotationOptions ): void {
	const properties: Record< string, number | boolean > = {
		has_annotations: hasAnnotations,
	};

	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}

	recordImageStudioEvent( 'image_studio_annotation_redo', properties );
}

/**
 * Tracks when an image is generated in Image Studio
 * @param options              - Tracking options
 * @param options.mode         - 'edit' or 'generate'
 * @param options.attachmentId - Attachment ID of the generated image
 * @param options.isAnnotated  - Whether the image was generated from an annotated source
 */
export function trackImageStudioImageGenerated( {
	mode,
	attachmentId,
	isAnnotated,
}: TrackImageStudioImageGeneratedOptions ): void {
	const properties: Record< string, string | number | boolean > = {
		mode,
		is_annotated: isAnnotated,
	};

	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}

	recordImageStudioEvent( 'image_studio_image_generated', properties );
}

/**
 * Tracks when an error occurs in Image Studio
 * @param options              - Tracking options
 * @param options.mode         - 'edit' or 'generate'
 * @param options.errorType    - Type of error that occurred
 * @param options.attachmentId - Attachment ID if applicable
 */
export function trackImageStudioError( {
	mode,
	errorType,
	attachmentId,
}: TrackImageStudioErrorOptions ): void {
	const properties: Record< string, string | number > = {
		mode,
		error_type: errorType,
	};

	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}

	recordImageStudioEvent( 'image_studio_error', properties );
}

/**
 * Tracks when a user provides thumbs up/down feedback on an image
 * @param options              - Tracking options
 * @param options.feedback     - User's feedback (up or down)
 * @param options.attachmentId - Attachment ID if available
 * @param options.mode         - 'edit' or 'generate'
 */
export function trackImageStudioImageFeedback( {
	feedback,
	attachmentId,
	mode,
}: TrackImageStudioImageFeedbackOptions ): void {
	const properties: Record< string, string | number > = { mode };

	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}

	recordImageStudioEvent( `image_studio_image_thumbs_${ feedback }`, properties );
}

/**
 * Tracks when the user navigates between media library images.
 * @param options              - Tracking options
 * @param options.attachmentId - Target attachment ID
 * @param options.direction    - 'previous' or 'next'
 */
export function trackImageStudioFileNavigated( {
	attachmentId,
	direction,
}: TrackImageStudioFileNavigatedOptions ): void {
	recordImageStudioEvent( 'image_studio_file_navigated', {
		attachment_id: attachmentId,
		direction,
	} );
}
