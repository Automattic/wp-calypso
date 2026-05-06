/**
 * Discriminated union for an image attachment as it moves through the
 * composer state machine: `compressing → uploading → uploaded`, with
 * `failed` as the off-ramp reachable from either step. Each variant
 * carries only the fields that exist in that state — TypeScript narrows
 * on `kind`, so consumers can't read a blob ref before it exists.
 */

import type { AtmosphereBlobRef, AtmosphereError } from '@automattic/api-core';

export type ComposerImage =
	| {
			kind: 'compressing';
			localId: string;
			sourceFile: File;
	  }
	| {
			kind: 'uploading';
			localId: string;
			previewUrl: string;
			alt: string;
			aspectRatio: { width: number; height: number };
			abort: AbortController;
	  }
	| {
			kind: 'uploaded';
			localId: string;
			previewUrl: string;
			alt: string;
			aspectRatio: { width: number; height: number };
			blob: AtmosphereBlobRef;
	  }
	| {
			kind: 'failed';
			localId: string;
			previewUrl: string;
			alt: string;
			aspectRatio: { width: number; height: number };
			sourceFile: File;
			error: AtmosphereError;
	  };
