/**
 * Update Canvas Image Ability
 *
 * WordPress Ability for refreshing the Image Studio canvas after
 * the backend saves a new attachment.
 */

import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect, select } from '@wordpress/data';
import { store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { trackImageStudioError, trackImageStudioImageGenerated } from '../utils/tracking';
import type { CanvasMetadata, ImageStudioActions } from '../store';

function preloadImage( url: string ): Promise< void > {
	if ( ! url || typeof window === 'undefined' ) {
		return Promise.resolve();
	}

	return new Promise( ( resolve ) => {
		const img = new window.Image();
		const done = () => resolve();
		img.onload = done;
		img.onerror = done;
		setTimeout( done, 3000 );
		img.src = url;
	} );
}

const ABILITY_NAME = 'image-studio/update-canvas-image';

// Track if ability has been registered to avoid duplicate registration
let isRegistered = false;

interface UpdateCanvasImageAbilityInput {
	attachmentId?: string | number | null;
	url?: string | null;
	metadata?: {
		title?: string | null;
		caption?: string | null;
		description?: string | null;
		alt_text?: string | null;
	};
}

/**
 * Register the update canvas image ability with WordPress Abilities API
 */
export async function registerUpdateCanvasImageAbility(): Promise< void > {
	// Prevent duplicate registration (e.g., from React Strict Mode)
	if ( isRegistered ) {
		return;
	}

	try {
		try {
			await registerAbilityCategory( 'image-studio', {
				label: 'Image Studio',
				description: 'Capabilities exposed by the Image Studio experience.',
			} );
		} catch ( categoryError ) {
			// Ignore "already registered" errors so we can safely re-use the category.
			const message = ( categoryError as Error )?.message || '';
			if ( ! message.includes( 'already exists' ) ) {
				throw categoryError;
			}
		}

		await registerAbility( {
			name: ABILITY_NAME,
			label: 'Update Canvas Image',
			category: 'image-studio',
			description: 'Refresh the Image Studio canvas after the backend saves a new attachment.',
			input_schema: {
				type: 'object',
				properties: {
					attachmentId: {
						type: 'string',
						description: 'The attachment ID that was updated or created.',
					},
					url: {
						type: 'string',
						description: 'URL to the edited image (cache busting handled client-side).',
					},
					metadata: {
						type: 'object',
						description: 'The metadata for the image.',
						properties: {
							title: {
								type: 'string',
								description: 'The title for the image.',
							},
							caption: {
								type: 'string',
								description: 'The caption for the image.',
							},
							description: {
								type: 'string',
								description: 'The description for the image.',
							},
							alt_text: {
								type: 'string',
								description: 'The alt text for the image.',
							},
						},
					},
				},
				required: [ 'attachmentId' ],
			},
			callback: async ( input: UpdateCanvasImageAbilityInput ) => {
				const attachmentId = input?.attachmentId ? Number( input.attachmentId ) : null;

				if ( attachmentId === null ) {
					// Track the error
					trackImageStudioError( {
						mode: ImageStudioMode.Edit,
						errorType: 'ability_failed',
					} );

					throw new Error( 'attachmentId is required to update the canvas image.' );
				}

				const url = input?.url || '';

				const { updateImageStudioCanvas, setDraftIds, setHasUpdatedMetadata, setCanvasMetadata } =
					dispatch( imageStudioStore ) as ImageStudioActions;

				const canvasMetadata = select( imageStudioStore ).getCanvasMetadata() || {};

				// Get current state from store
				const storeSelectors = select( imageStudioStore ) as any;
				const currentDraftIds = storeSelectors.getDraftIds() || [];
				const originalAttachmentId = storeSelectors.getOriginalAttachmentId();

				// Determine mode based on whether there was an original attachment
				const mode =
					originalAttachmentId !== null ? ImageStudioMode.Edit : ImageStudioMode.Generate;

				let metadata = canvasMetadata as CanvasMetadata;
				const pairs = Object.entries( input?.metadata || {} );
				for ( const [ key, value ] of pairs ) {
					if ( ! value ) {
						continue;
					}
					metadata = { ...metadata, [ key ]: value };
				}

				if ( metadata !== canvasMetadata ) {
					setHasUpdatedMetadata( true );
					setCanvasMetadata( metadata );
				}

				// In Generate mode (originalAttachmentId is null), ALL images are drafts
				// In Edit mode (originalAttachmentId set on open), original is protected, new images are drafts
				// Either way, add the new image to draftIds IMMEDIATELY to ensure cleanup works
				// even if subsequent operations fail (preloadImage, updateImageStudioCanvas, etc.)
				// Use Set to prevent duplicates in case agent loops or ability is called multiple times
				const updatedDraftIds = new Set< number >( currentDraftIds );
				updatedDraftIds.add( attachmentId );

				await setDraftIds( [ ...updatedDraftIds ] );

				try {
					await preloadImage( url );

					// Pass through the real attachment ID so the modal stays mounted
					// This sets activeId (imageStudioAttachmentId)
					await updateImageStudioCanvas( url, attachmentId, false );

					// Invalidate the cached attachment data in the core store
					// Then trigger a fresh fetch so the attachment is available for subsequent context reads
					const coreDispatch = dispatch( coreStore ) as any;
					if ( coreDispatch?.invalidateResolution ) {
						coreDispatch.invalidateResolution( 'getEntityRecord', [
							'postType',
							'attachment',
							attachmentId,
						] );

						// Trigger the resolver to fetch fresh data from the REST API
						// This ensures detectImageEntity() will have the attachment metadata
						try {
							await resolveSelect( coreStore ).getEntityRecord(
								'postType',
								'attachment',
								attachmentId
							);
						} catch ( error ) {
							// If the fetch fails, log but don't fail the ability
							window.console?.warn?.(
								`[Image Studio] Failed to fetch attachment ${ attachmentId }:`,
								error
							);
						}
					}

					// Track successful image generation (non-annotated)
					trackImageStudioImageGenerated( {
						mode,
						attachmentId,
						isAnnotated: false,
					} );
				} catch ( error ) {
					// Track the error
					trackImageStudioError( {
						mode,
						errorType: 'ability_failed',
						attachmentId,
					} );
				}

				return {
					success: true,
					message: 'Canvas image updated successfully.',
				};
			},
		} );

		// Mark as registered
		isRegistered = true;
	} catch ( error ) {
		// If ability is already registered, silently ignore
		// This can happen in development with hot module reloading or React Strict Mode
		if ( error instanceof Error && error.message.includes( 'already registered' ) ) {
			isRegistered = true;
			return;
		}
		// Re-throw other errors as they indicate a real problem
		throw error;
	}
}
