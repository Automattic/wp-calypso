/**
 * Shared types for file upload and media handling in Image Studio.
 * These types provide a contract for upload utilities and media transformations.
 */

import type { Attachment } from '@wordpress/media-utils';

/**
 * Partial media upload result from WordPress media-utils.
 * Represents an uploaded media item with optional fields.
 */
export type UploadedMedia = Partial< Attachment >;

/**
 * Generic upload callback signature for successful uploads.
 */
export type UploadSuccessCallback< T = UploadedMedia > = ( media: T ) => void | Promise< void >;

/**
 * Generic upload callback signature for upload errors.
 */
export type UploadErrorCallback = ( error: Error ) => void;

/**
 * Options for uploading an annotated image.
 */
export interface UploadAnnotationOptions {
	/** The image blob to upload */
	blob: Blob;
	/** Original filename for generating the new filename */
	originalFilename?: string;
	/** Optional metadata to attach to the uploaded image */
	metadata?: {
		title?: string;
		alt_text?: string;
		caption?: string;
		description?: string;
	};
	/** Callback invoked when upload succeeds */
	onSuccess: UploadSuccessCallback;
	/** Optional callback invoked when upload fails */
	onError?: UploadErrorCallback;
}

/**
 * Generic file validation result.
 */
export interface FileValidationResult {
	/** Whether the file is valid */
	valid: boolean;
	/** Error message if invalid */
	error?: string;
	/** Validated file if valid */
	file?: File;
}

/**
 * Options for file-to-blob conversion.
 */
export interface FileToBlobOptions {
	/** MIME type for the output blob */
	type?: string;
	/** Quality for lossy formats (0-1) */
	quality?: number;
}

/**
 * Generic upload progress info.
 */
export interface UploadProgress {
	/** Bytes loaded so far */
	loaded: number;
	/** Total bytes to upload */
	total: number;
	/** Percentage complete (0-100) */
	percentage: number;
}

/**
 * Upload state discriminated union.
 */
export type UploadState =
	| { status: 'idle' }
	| { status: 'uploading'; progress: UploadProgress }
	| { status: 'success'; media: UploadedMedia }
	| { status: 'error'; error: Error };
