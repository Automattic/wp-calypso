/**
 * WordPress type declarations for Image Studio
 *
 * Provides typed interfaces for @wordpress/data and @wordpress/core-data
 * interactions, eliminating `as any` casts at WordPress API boundaries.
 */

/**
 * Typed interface for core-data dispatch actions used by Image Studio.
 * The full core-data store has many more actions, but we only type the ones we use.
 */
export interface CoreDataDispatch {
	saveEntityRecord: (
		kind: string,
		name: string,
		record: Record< string, unknown >,
		options?: {
			isAutosave?: boolean;
			__unstableFetch?: ( ...args: unknown[] ) => Promise< unknown >;
			throwOnError?: boolean;
		}
	) => Promise< unknown >;

	deleteEntityRecord: (
		kind: string,
		name: string,
		recordId: number | string,
		query?: Record< string, unknown > | null,
		options?: {
			__unstableFetch?: ( ...args: unknown[] ) => Promise< unknown >;
			throwOnError?: boolean;
			force?: boolean;
		}
	) => Promise< boolean | undefined >;

	/**
	 * Invalidate the resolution cache for a specific selector.
	 * This is a metadata action automatically added by @wordpress/data to all stores.
	 */
	invalidateResolution: ( selectorName: string, args?: unknown[] ) => void;
}

/**
 * Typed interface for Image Studio store selectors as returned by
 * `select( imageStudioStore )` (state parameter already curried away).
 */
export interface CurriedImageStudioSelectors {
	getIsImageStudioOpen: () => boolean;
	getImageStudioAttachmentId: () => number | null;
	getImageStudioOriginalImageUrl: () => string | null;
	getImageStudioCurrentImageUrl: () => string | null;
	getImageStudioAiProcessing: () => boolean;
	getIsAnnotationMode: () => boolean;
	getImageStudioTransitioning: () => boolean;
	getAnnotationCanvasRef: () => import('../store').AnnotationCanvasRef | null;
	getOriginalAttachmentId: () => number | null;
	getDraftIds: () => number[];
	getHasUpdatedMetadata: () => boolean;
	getCanvasMetadata: () => import('../store').CanvasMetadata | null;
	getIsAnnotationSaving: () => boolean;
	getAnnotatedAttachmentIds: () => number[];
	getLastSavedAttachmentId: () => number | null;
	getSavedAttachmentIds: () => number[];
	getHasUnsavedChanges: () => boolean;
	getIsExitConfirmed: () => boolean;
	getEntryPoint: () => import('../store').ImageStudioEntryPoint | null;
	getOnCloseCallback: () =>
		| ( ( image: import('../utils/get-image-data').ImageData | null ) => Promise< void > | void )
		| null;
	getNotices: () => import('../store').Notice[];
	getNavigableAttachmentIds: () => number[];
	getCurrentNavigationIndex: () => number;
	getHasNextImage: () => boolean;
	getHasPreviousImage: () => boolean;
	getNextAttachmentId: () => number | null;
	getPreviousAttachmentId: () => number | null;
	getIsSidebarOpen: () => boolean;
	getNavigationCurrentPage: () => number;
	getNavigationHasMorePages: () => boolean;
	getSelectedStyle: () => string | null;
	getSelectedAspectRatio: () => string | null;
	getLastAgentMessageId: () => string | null;
}

/**
 * Typed interface for block-editor selectors used by Image Studio.
 * The @wordpress/block-editor package doesn't export typed selectors,
 * so we define the subset we depend on.
 *
 * TODO: remove when @wordpress/block-editor exports store types
 */
export interface BlockEditorSelectors {
	getBlocks: ( rootClientId?: string ) => WPBlock[];
	getBlocksByName: ( blockName: string ) => string[];
	getBlock: ( clientId: string ) => WPBlock | null;
}

/**
 * Typed interface for core-data selectors used by Image Studio.
 * The @wordpress/core-data package doesn't export typed selectors,
 * so we define the subset we depend on.
 *
 * TODO: remove when @wordpress/core-data exports store types
 */
export interface CoreDataSelectors {
	getEntityRecord: (
		kind: string,
		name: string,
		key: number | string
	) => AttachmentRecord | undefined;
}

/**
 * A WordPress block from the block editor store.
 * Simplified interface covering the fields used by client-context.
 */
export interface WPBlock {
	name: string;
	clientId: string;
	attributes?: Record< string, unknown >;
	innerBlocks?: WPBlock[];
}

/**
 * Minimal attachment record shape for fields Image Studio reads.
 * The full WordPress Attachment entity has many more fields.
 */
export interface AttachmentRecord {
	id: number;
	source_url: string;
	date: string;
	title?: { rendered: string } | string;
	caption?: { rendered: string } | string;
	description?: { rendered: string } | string;
	alt_text?: string;
	mime_type?: string;
	media_details?: {
		width: number;
		height: number;
	};
}

/**
 * WordPress Media backbone model interface (window.wp.media).
 * Used in legacy media library grid view overrides.
 */
export interface WpMedia {
	attachment: ( id: number ) => WpMediaAttachmentModel | undefined;
}

export interface WpMediaAttachmentModel {
	get: ( key: string ) => string | undefined;
}

/**
 * Global Window extensions used by Image Studio.
 */
declare global {
	interface Window {
		/**
		 * WordPress admin page identifier. Set by WordPress on admin pages.
		 * Value is 'upload' on the Media Library page (upload.php).
		 */
		pagenow?: string;

		/**
		 * WordPress global namespace containing media library utilities.
		 */
		wp?: {
			media?: WpMedia;
			/**
			 * WordPress data module for store access outside React context.
			 * Provides select/dispatch for any registered store.
			 */
			data?: {
				select: ( storeName: string ) => unknown;
				dispatch: ( storeName: string ) => unknown;
			};
		};
	}
}
