/**
 * Runtime type guards for Image Studio shared types.
 * Provides type narrowing and validation at WordPress API boundaries.
 */

import type {
	MediaAttachment,
	BlockEditProps,
	BlockEditorDispatch,
	GenerationRequest,
	ImageGenerationRequest,
	ImageEditRequest,
	GenerationResult,
	GenerationSuccess,
	GenerationError,
	JobState,
	ErrorPayload,
	OperationState,
	IdleOperationState,
	ProcessingOperationState,
	SuccessOperationState,
	ErrorOperationState,
} from './index';
import type { AttachmentRecord, WPBlock, CoreDataDispatch } from './wordpress';

/**
 * Type guard for MediaAttachment interface.
 * Validates that an object matches the WordPress REST API attachment shape.
 */
export function isMediaAttachment( obj: unknown ): obj is MediaAttachment {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		typeof candidate.id === 'number' &&
		typeof candidate.source_url === 'string' &&
		typeof candidate.link === 'string' &&
		typeof candidate.mime_type === 'string'
	);
}

/**
 * Type guard for AttachmentRecord interface.
 * Validates minimal attachment record shape from core-data store.
 */
export function isAttachmentRecord( obj: unknown ): obj is AttachmentRecord {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		typeof candidate.id === 'number' &&
		typeof candidate.source_url === 'string' &&
		typeof candidate.date === 'string'
	);
}

/**
 * Type guard for WPBlock interface.
 * Validates that an object is a WordPress block editor block.
 */
export function isWPBlock( obj: unknown ): obj is WPBlock {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return typeof candidate.name === 'string' && typeof candidate.clientId === 'string';
}

/**
 * Type guard for BlockEditProps interface.
 * Validates block editor component props.
 */
export function isBlockEditProps( obj: unknown ): obj is BlockEditProps {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		typeof candidate.name === 'string' &&
		typeof candidate.clientId === 'string' &&
		typeof candidate.isSelected === 'boolean' &&
		typeof candidate.attributes === 'object' &&
		typeof candidate.setAttributes === 'function'
	);
}

/**
 * Type guard to check if a dispatch object has core-data methods.
 * Useful for validating useDispatch returns at runtime.
 */
export function isCoreDataDispatch( obj: unknown ): obj is CoreDataDispatch {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		typeof candidate.saveEntityRecord === 'function' &&
		typeof candidate.deleteEntityRecord === 'function' &&
		typeof candidate.invalidateResolution === 'function'
	);
}

/**
 * Type guard to check if a dispatch object has block-editor methods.
 */
export function isBlockEditorDispatch( obj: unknown ): obj is BlockEditorDispatch {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return typeof candidate.updateBlockAttributes === 'function';
}

/**
 * Type guard for validating file is an image with supported MIME type.
 */
export function isSupportedImageFile( file: File, supportedTypes: readonly string[] ): boolean {
	return supportedTypes.includes( file.type );
}

/**
 * Type guard for checking if a value is a valid Blob.
 */
export function isBlob( obj: unknown ): obj is Blob {
	return obj instanceof Blob;
}

/**
 * Type guard for checking if a value is a File (subclass of Blob).
 */
export function isFile( obj: unknown ): obj is File {
	return obj instanceof File;
}

/**
 * Type guard for ErrorPayload interface.
 * Validates structured error payload shape.
 */
export function isErrorPayload( obj: unknown ): obj is ErrorPayload {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		typeof candidate.category === 'string' &&
		typeof candidate.message === 'string' &&
		typeof candidate.timestamp === 'number'
	);
}

/**
 * Type guard for GenerationSuccess interface.
 * Validates successful generation result shape.
 */
export function isGenerationSuccess( obj: unknown ): obj is GenerationSuccess {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		candidate.status === 'success' &&
		typeof candidate.attachmentId === 'number' &&
		typeof candidate.imageUrl === 'string'
	);
}

/**
 * Type guard for GenerationError interface.
 * Validates failed generation result shape.
 */
export function isGenerationError( obj: unknown ): obj is GenerationError {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return candidate.status === 'error' && isErrorPayload( candidate.error );
}

/**
 * Type guard for GenerationResult discriminated union.
 * Narrows to either GenerationSuccess or GenerationError.
 */
export function isGenerationResult( obj: unknown ): obj is GenerationResult {
	return isGenerationSuccess( obj ) || isGenerationError( obj );
}

/**
 * Type guard for ImageGenerationRequest interface.
 * Validates image generation request shape.
 */
export function isImageGenerationRequest( obj: unknown ): obj is ImageGenerationRequest {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		candidate.type === 'generate' &&
		typeof candidate.sessionId === 'string' &&
		typeof candidate.prompt === 'string'
	);
}

/**
 * Type guard for ImageEditRequest interface.
 * Validates image edit request shape.
 */
export function isImageEditRequest( obj: unknown ): obj is ImageEditRequest {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		candidate.type === 'edit' &&
		typeof candidate.sessionId === 'string' &&
		typeof candidate.prompt === 'string' &&
		typeof candidate.attachmentId === 'number'
	);
}

/**
 * Type guard for GenerationRequest discriminated union.
 * Narrows to either ImageGenerationRequest or ImageEditRequest.
 */
export function isGenerationRequest( obj: unknown ): obj is GenerationRequest {
	return isImageGenerationRequest( obj ) || isImageEditRequest( obj );
}

/**
 * Type guard for JobState interface.
 * Validates job state structure with generic result type.
 */
export function isJobState< TResult = unknown >( obj: unknown ): obj is JobState< TResult > {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		typeof candidate.jobId === 'string' &&
		typeof candidate.status === 'string' &&
		typeof candidate.createdAt === 'number' &&
		typeof candidate.updatedAt === 'number'
	);
}

/**
 * Type guard for IdleOperationState interface.
 */
export function isIdleOperationState( obj: unknown ): obj is IdleOperationState {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return candidate.status === 'idle';
}

/**
 * Type guard for ProcessingOperationState interface.
 */
export function isProcessingOperationState( obj: unknown ): obj is ProcessingOperationState {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return candidate.status === 'processing';
}

/**
 * Type guard for SuccessOperationState interface.
 */
export function isSuccessOperationState< TData = unknown >(
	obj: unknown
): obj is SuccessOperationState< TData > {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return (
		candidate.status === 'success' &&
		candidate.data !== undefined &&
		typeof candidate.completedAt === 'number'
	);
}

/**
 * Type guard for ErrorOperationState interface.
 */
export function isErrorOperationState( obj: unknown ): obj is ErrorOperationState {
	if ( typeof obj !== 'object' || obj === null ) {
		return false;
	}

	const candidate = obj as Record< string, unknown >;

	return candidate.status === 'error' && isErrorPayload( candidate.error );
}

/**
 * Type guard for OperationState discriminated union.
 * Narrows to one of the four operation state types.
 */
export function isOperationState< TData = unknown >(
	obj: unknown
): obj is OperationState< TData > {
	return (
		isIdleOperationState( obj ) ||
		isProcessingOperationState( obj ) ||
		isSuccessOperationState( obj ) ||
		isErrorOperationState( obj )
	);
}
