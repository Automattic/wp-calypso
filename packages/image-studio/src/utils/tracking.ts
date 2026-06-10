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
const SITE_TYPES = [ 'simple', 'atomic', 'jetpack' ] as const;

type ImageStudioSiteType = ( typeof SITE_TYPES )[ number ];
type ImageStudioTrackingData = {
	blogId?: number | string;
	siteType?: string;
	isA11n?: boolean;
	isDevMode?: boolean;
};

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
		const imageStudioSelectors = select( imageStudioStore );
		if ( imageStudioSelectors && imageStudioSelectors.getEntryPoint ) {
			return imageStudioSelectors.getEntryPoint();
		}
	} catch ( error ) {
		// Store may not be registered yet
	}
	return null;
}

function getImageStudioWindowData(): ImageStudioTrackingData | undefined {
	return ( window as unknown as { imageStudioData?: ImageStudioTrackingData } ).imageStudioData;
}

function getTrackingBlogId(): number | null {
	const blogId = getImageStudioWindowData()?.blogId;

	if ( typeof blogId !== 'number' && typeof blogId !== 'string' ) {
		return null;
	}

	const parsedBlogId = typeof blogId === 'number' ? blogId : Number( blogId );

	return Number.isFinite( parsedBlogId ) && parsedBlogId > 0 ? parsedBlogId : null;
}

function getTrackingSiteType(): ImageStudioSiteType {
	const siteType = getImageStudioWindowData()?.siteType;

	if ( SITE_TYPES.includes( siteType as ImageStudioSiteType ) ) {
		return siteType as ImageStudioSiteType;
	}

	if ( siteType === 'wpcom' ) {
		return 'simple';
	}

	if ( siteType === 'woa' ) {
		return 'atomic';
	}

	return 'jetpack';
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
	const blogId = getTrackingBlogId();
	const siteType = getTrackingSiteType();
	const imageStudioWindowData = getImageStudioWindowData();
	const baseProps: Record< string, string | number | boolean > = {
		...properties,
		sessionid: getSessionId(),
	};

	if ( blogId ) {
		baseProps.blog_id = blogId;
	}

	baseProps.site_type = siteType;

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

	baseProps.is_a11n = !! imageStudioWindowData?.isA11n;

	// Add dev mode flag for filtering test/internal traffic
	baseProps.is_test = !! imageStudioWindowData?.isDevMode;

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
		| 'delete_permanently_failed'
		| 'save_metadata_failed'
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
	if ( entryPoint ) {
		properties.placement = entryPoint;
	}
	recordImageStudioEvent( 'image_studio_opened', properties );
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

interface TrackImageStudioStyleSelectedOptions {
	style: string;
	mode: ImageStudioMode;
}

/**
 * Tracks when a user selects a style in Image Studio
 * @param {Object} options       - Tracking options
 * @param {string} options.style - The selected style value
 * @param {string} options.mode  - 'edit' or 'generate'
 */
export function trackImageStudioStyleSelected( {
	style,
	mode,
}: TrackImageStudioStyleSelectedOptions ): void {
	recordImageStudioEvent( 'image_studio_style_selected', {
		style,
		mode,
	} );
}

interface TrackImageStudioAspectRatioSelectedOptions {
	aspectRatio: string;
	mode: ImageStudioMode;
}

/**
 * Tracks when a user selects an aspect ratio in Image Studio
 * @param {Object} options             - Tracking options
 * @param {string} options.aspectRatio - The selected aspect ratio value
 * @param {string} options.mode        - 'edit' or 'generate'
 */
export function trackImageStudioAspectRatioSelected( {
	aspectRatio,
	mode,
}: TrackImageStudioAspectRatioSelectedOptions ): void {
	recordImageStudioEvent( 'image_studio_aspect_ratio_selected', {
		aspect_ratio: aspectRatio,
		mode,
	} );
}

/**
 * Tracks when an image is permanently deleted from Image Studio
 * @param {Object} options                - Tracking options
 * @param {number} [options.attachmentId] - Attachment ID of the deleted image
 * @param {string} options.mode           - 'edit' or 'generate'
 */
export function trackImageStudioImageDeletedPermanently( {
	attachmentId,
	mode,
}: {
	attachmentId?: number;
	mode: string;
} ): void {
	const properties: Record< string, number | string > = { mode };
	if ( attachmentId ) {
		properties.attachment_id = attachmentId;
	}
	recordImageStudioEvent( 'image_studio_file_deleted_permanently', properties );
}

/**
 * Surface a clip share originated from. Distinguishes the post-editor Feature
 * Clip sidebar from the in-modal Image Studio share row so per-surface share
 * funnels can be computed.
 */
export type ShareSurface = 'sidebar' | 'modal';

/**
 * Tracks when the Reel share button is clicked, before any pre-checks run.
 * @param options                  - Tracking options
 * @param options.surface          - Where the share originated ('sidebar' | 'modal')
 * @param options.attachmentId     - The video attachment ID
 * @param options.durationSeconds  - Optional duration of the clip in seconds
 */
export function trackImageStudioReelShareClicked( {
	surface,
	attachmentId,
	durationSeconds,
}: {
	surface: ShareSurface;
	attachmentId: number;
	durationSeconds?: number | null;
} ): void {
	const properties: Record< string, string | number > = {
		surface,
		attachment_id: attachmentId,
	};
	if ( durationSeconds != null ) {
		properties.duration_seconds = durationSeconds;
	}
	recordImageStudioEvent( 'image_studio_feature_clip_share_clicked', properties );
}

/**
 * Tracks when the Reel share is blocked by a missing Instagram Business connection.
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 */
export function trackImageStudioReelShareNotConnected( {
	surface,
}: {
	surface: ShareSurface;
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_share_not_connected', { surface } );
}

/**
 * Tracks when the Reel share is blocked because the IG connection exists but is
 * toggled off for this post in the Jetpack Social sidebar.
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 */
export function trackImageStudioReelShareConnectionDisabled( {
	surface,
}: {
	surface: ShareSurface;
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_share_connection_disabled', { surface } );
}

/**
 * Tracks when the Reel share is blocked because the post isn't published yet.
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 */
export function trackImageStudioReelShareNotPublished( {
	surface,
}: {
	surface: ShareSurface;
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_share_post_not_published', { surface } );
}

/**
 * Tracks when the Reel share is blocked by missing video state (defensive).
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 */
export function trackImageStudioReelShareInvalidState( {
	surface,
}: {
	surface: ShareSurface;
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_share_invalid_state', { surface } );
}

/**
 * Tracks when the user dismisses the Reel share confirmation dialog.
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 */
export function trackImageStudioReelShareCancelled( { surface }: { surface: ShareSurface } ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_share_cancelled', { surface } );
}

/**
 * Tracks when shareCurrentPost successfully dispatched the IG submission.
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 */
export function trackImageStudioReelShareDispatched( {
	surface,
}: {
	surface: ShareSurface;
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_share_dispatched', { surface } );
}

/**
 * Tracks when shareCurrentPost returned false or threw.
 * @param options              - Tracking options
 * @param options.surface      - Where the share originated ('sidebar' | 'modal')
 * @param options.errorMessage - Optional error description from the thunk/exception.
 */
export function trackImageStudioReelShareFailed( {
	surface,
	errorMessage,
}: {
	surface: ShareSurface;
	errorMessage?: string;
} ): void {
	const properties: Record< string, string | number > = { surface };
	if ( errorMessage ) {
		properties.error_message = errorMessage;
	}
	recordImageStudioEvent( 'image_studio_feature_clip_share_failed', properties );
}

/**
 * Tracks when the generic share initiates a particular method. Fires once per
 * attempted method, before the work runs.
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 * @param options.method  - 'web-share' (Web Share API attempt) or 'web-share-unsupported'
 *                          (canShare rejected files / Web Share unavailable).
 */
export function trackImageStudioGenericShareClicked( {
	surface,
	method,
}: {
	surface: ShareSurface;
	method: 'web-share' | 'web-share-unsupported';
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_generic_share_clicked', { surface, method } );
}

/**
 * Tracks when the generic share completed successfully.
 * @param options         - Tracking options
 * @param options.surface - Where the share originated ('sidebar' | 'modal')
 * @param options.method  - 'web-share' (the only method that can complete;
 *                          'web-share-unsupported' is a precondition failure).
 */
export function trackImageStudioGenericShareCompleted( {
	surface,
	method,
}: {
	surface: ShareSurface;
	method: 'web-share';
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_generic_share_completed', {
		surface,
		method,
	} );
}

/**
 * Tracks when the generic share failed.
 * @param options             - Tracking options
 * @param options.surface     - Where the share originated ('sidebar' | 'modal')
 * @param options.method      - 'web-share' or 'web-share-unsupported'
 * @param options.message     - Optional error message
 * @param options.failureKind - Optional categorical reason: 'http' (fetch returned !ok).
 */
export function trackImageStudioGenericShareFailed( {
	surface,
	method,
	message,
	failureKind,
}: {
	surface: ShareSurface;
	method: 'web-share' | 'web-share-unsupported';
	message?: string;
	failureKind?: 'http';
} ): void {
	const properties: Record< string, string | number > = { surface, method };
	if ( message ) {
		properties.error_message = message;
	}
	if ( failureKind ) {
		properties.failure_kind = failureKind;
	}
	recordImageStudioEvent( 'image_studio_feature_clip_generic_share_failed', properties );
}

/**
 * Tracks when a generated Feature Clip is inserted into the post via the
 * sidebar's "Add to post" action — the primary clip → post conversion.
 * @param options              - Tracking options
 * @param options.attachmentId - The video attachment ID added to the post
 */
export function trackImageStudioFeatureClipAddedToPost( {
	attachmentId,
}: {
	attachmentId: number;
} ): void {
	recordImageStudioEvent( 'image_studio_feature_clip_added_to_post', {
		attachment_id: attachmentId,
		surface: 'sidebar',
	} );
}

/**
 * Tracks when the Feature Clip sidebar panel is rendered in the post editor.
 * Fires once per panel mount — the impression denominator for sidebar
 * engagement rates.
 */
export function trackImageStudioFeatureClipPanelViewed(): void {
	recordImageStudioEvent( 'image_studio_feature_clip_panel_viewed' );
}
