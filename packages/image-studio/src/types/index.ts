export { ImageStudioEntryPoint } from '../store/index';

export interface ImageStudioConfig {
	attachmentId?: number;
	imageData?: {
		id: number;
		url: string;
		title: string;
		caption: string;
		alt: string;
		width?: number;
		height?: number;
		description?: string;
		filename?: string;
	};
}

import type { AgentConfigFactory } from '../utils/agent-config';

export interface ImageStudioProps {
	image: File | string;
	/** Save current image as checkpoint (modal stays open) */
	onSave: () => Promise< void > | void;
	/** Handle discard logic (restore original, clear checkpoint) */
	onDiscard: () => Promise< void > | void;
	/** Exit modal (cleanup, close) */
	onExit: ( hasChanges: boolean ) => Promise< void > | void;
	/** Navigate to Media Library editor (save, cleanup, navigate) */
	onClassicMediaEditorNavigation?: ( url: string ) => Promise< void >;
	/** Navigate to previous image in media library */
	onNavigatePrevious?: () => void;
	/** Navigate to next image in media library */
	onNavigateNext?: () => void;
	/** Whether there is a previous image available */
	hasPreviousImage?: boolean;
	/** Whether there is a next image available */
	hasNextImage?: boolean;
	className?: string;
	config: ImageStudioConfig;
	agentConfigFactory?: AgentConfigFactory;
}

export enum ImageStudioMode {
	Edit = 'edit',
	Generate = 'generate',
}

export enum ToolbarOption {
	Annotate = 'annotate',
	AltText = 'alt-text',
}

export enum MetadataField {
	Title = 'title',
	Caption = 'caption',
	Description = 'description',
	AltText = 'alt_text',
}

/**
 * Supported image MIME types for Image Studio.
 * Keep in sync with the list in https://github.a8c.com/Automattic/wpcom/blob/14f1b110a11250b6a1834a31376c9a9f68ff1b0a/wp-content/lib/ai/tools/big-sky/images/class.image-utils.php#L783
 */
export const IMAGE_STUDIO_SUPPORTED_MIME_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/bmp',
	'image/tiff',
] as const;

/**
 * Props passed to a BlockEdit component by the block editor.
 */
export interface BlockEditProps {
	name: string;
	clientId: string;
	isSelected: boolean;
	attributes: Record< string, unknown >;
	setAttributes: ( attrs: Record< string, unknown > ) => void;
}

/**
 * A WordPress media attachment record as returned by getEntityRecord for 'attachment' post type.
 * This is the REST API shape before transformation.
 */
export interface MediaAttachment {
	id: number;
	source_url: string;
	link: string;
	mime_type: string;
	alt_text?: string;
	title?: {
		rendered: string;
		raw: string;
	};
	caption?: {
		rendered: string;
		raw: string;
	};
	description?: {
		rendered: string;
		raw: string;
	};
	media_details?: {
		width: number;
		height: number;
		sizes?: Record<
			string,
			{
				source_url: string;
				width: number;
				height: number;
				mime_type: string;
			}
		>;
	};
}

/**
 * Callback for media selection in block editor contexts.
 * Uses a generic record type since the transformed attachment shape
 * varies depending on the WordPress media-utils version.
 */
export type MediaSelectCallback = (
	media: Record< string, unknown > | Record< string, unknown >[]
) => void;

/**
 * Block editor store dispatch with updateBlockAttributes action.
 * The @wordpress/block-editor package doesn't export store action types,
 * so we define just the action we need.
 */
export interface BlockEditorDispatch {
	updateBlockAttributes: ( clientId: string, attributes: Record< string, unknown > ) => void;
}

// Re-export annotation types
export type { AnnotationPoint, AnnotationPath, AnnotationTool } from './annotation';

// Re-export agenttic types
export type { AgentMessage } from './agenttic';

// Re-export upload types
export type {
	UploadedMedia,
	UploadSuccessCallback,
	UploadErrorCallback,
	UploadAnnotationOptions,
	FileValidationResult,
	FileToBlobOptions,
	UploadProgress,
	UploadState,
} from './upload';

/**
 * Generation request types for Image Studio AI operations.
 */

/**
 * Base request parameters shared across all generation types.
 */
export interface GenerationRequestBase {
	/** Session ID for tracking the generation request */
	sessionId: string;
	/** User prompt or instruction for the AI */
	prompt: string;
	/** Optional metadata to attach to generated image */
	metadata?: {
		title?: string;
		alt_text?: string;
		caption?: string;
		description?: string;
	};
}

/**
 * Request to generate a new image from scratch.
 */
export interface ImageGenerationRequest extends GenerationRequestBase {
	type: 'generate';
	/** Selected style preset identifier */
	style?: string | null;
	/** Selected aspect ratio (e.g., '1:1', '16:9') */
	aspectRatio?: string | null;
}

/**
 * Request to edit an existing image.
 */
export interface ImageEditRequest extends GenerationRequestBase {
	type: 'edit';
	/** ID of the attachment being edited */
	attachmentId: number;
	/** Annotation data if using annotation mode */
	annotation?: Blob;
}

/**
 * Discriminated union of all generation request types.
 */
export type GenerationRequest = ImageGenerationRequest | ImageEditRequest;

/**
 * Job status types for tracking asynchronous generation operations.
 */

/**
 * Processing states for generation jobs.
 */
export enum JobStatus {
	/** Job is queued but not yet started */
	Pending = 'pending',
	/** Job is actively processing */
	Processing = 'processing',
	/** Job completed successfully */
	Success = 'success',
	/** Job failed with an error */
	Error = 'error',
	/** Job was cancelled by user */
	Cancelled = 'cancelled',
}

/**
 * Generic job state for tracking long-running operations.
 */
export interface JobState< TResult = unknown > {
	/** Unique identifier for the job */
	jobId: string;
	/** Current status of the job */
	status: JobStatus;
	/** Result data if status is Success */
	result?: TResult;
	/** Error information if status is Error */
	error?: ErrorPayload;
	/** Optional progress indicator (0-100) */
	progress?: number;
	/** Timestamp when the job was created */
	createdAt: number;
	/** Timestamp when the job last updated */
	updatedAt: number;
}

/**
 * Generation result types for AI operation outcomes.
 */

/**
 * Successful generation result.
 */
export interface GenerationSuccess {
	status: 'success';
	/** ID of the generated/modified attachment */
	attachmentId: number;
	/** URL of the generated/modified image */
	imageUrl: string;
	/** Optional metadata returned by the backend */
	metadata?: {
		width?: number;
		height?: number;
		mimeType?: string;
		fileSize?: number;
	};
}

/**
 * Failed generation result.
 */
export interface GenerationError {
	status: 'error';
	/** Structured error payload */
	error: ErrorPayload;
}

/**
 * Discriminated union of generation result types.
 */
export type GenerationResult = GenerationSuccess | GenerationError;

/**
 * Error payload types for structured error handling.
 */

/**
 * Error categories for different failure modes.
 */
export enum ErrorCategory {
	/** Network or connectivity errors */
	Network = 'network',
	/** Authentication or authorization errors */
	Auth = 'auth',
	/** Validation errors (invalid input) */
	Validation = 'validation',
	/** Rate limiting or quota errors */
	RateLimit = 'rate_limit',
	/** Server-side processing errors */
	Server = 'server',
	/** Client-side errors */
	Client = 'client',
	/** Unknown or uncategorized errors */
	Unknown = 'unknown',
}

/**
 * Structured error payload for consistent error handling.
 */
export interface ErrorPayload {
	/** Error category for routing to appropriate handler */
	category: ErrorCategory;
	/** Human-readable error message */
	message: string;
	/** Optional error code for specific error types */
	code?: string;
	/** Optional HTTP status code if from network request */
	statusCode?: number;
	/** Optional additional details for debugging */
	details?: Record< string, unknown >;
	/** Timestamp when the error occurred */
	timestamp: number;
}

/**
 * Store state union types for different operational modes.
 */

/**
 * Idle state - no active operations.
 */
export interface IdleOperationState {
	status: 'idle';
}

/**
 * Processing state - operation in progress.
 */
export interface ProcessingOperationState {
	status: 'processing';
	/** Optional source identifier for tracking multiple concurrent operations */
	source?: string;
	/** Optional progress indicator (0-100) */
	progress?: number;
}

/**
 * Success state - operation completed successfully.
 */
export interface SuccessOperationState< TData = unknown > {
	status: 'success';
	/** Result data from the operation */
	data: TData;
	/** Timestamp when operation completed */
	completedAt: number;
}

/**
 * Error state - operation failed.
 */
export interface ErrorOperationState {
	status: 'error';
	/** Structured error information */
	error: ErrorPayload;
}

/**
 * Discriminated union for operation state tracking.
 * Generic type parameter allows specifying the success data type.
 */
export type OperationState< TData = unknown > =
	| IdleOperationState
	| ProcessingOperationState
	| SuccessOperationState< TData >
	| ErrorOperationState;

// Re-export runtime type guards
export {
	isMediaAttachment,
	isAttachmentRecord,
	isWPBlock,
	isBlockEditProps,
	isCoreDataDispatch,
	isBlockEditorDispatch,
	isSupportedImageFile,
	isBlob,
	isFile,
	isErrorPayload,
	isGenerationSuccess,
	isGenerationError,
	isGenerationResult,
	isImageGenerationRequest,
	isImageEditRequest,
	isGenerationRequest,
	isJobState,
	isIdleOperationState,
	isProcessingOperationState,
	isSuccessOperationState,
	isErrorOperationState,
	isOperationState,
} from './guards';

// Re-export WordPress type declarations (these are ambient, so we don't re-export them)
// They're available globally through wordpress.d.ts module augmentation
