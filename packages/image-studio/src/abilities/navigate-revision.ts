/**
 * Navigate Revision Ability
 *
 * WordPress Ability that moves the Image Studio canvas between the revisions
 * already in this session, the same way the revision navigator's chevrons do.
 * It lets the agent answer "undo" or "go back to the original" without
 * generating a new image.
 */

import { registerAbility } from '@wordpress/abilities';
import { store as coreStore } from '@wordpress/core-data';
import { dispatch, select } from '@wordpress/data';
import { store as imageStudioStore } from '../store';
import { getRevisionHistory } from '../utils/revision-history';
import { trackImageStudioRevisionNavigated } from '../utils/tracking';
import type { ImageStudioActions } from '../store';
import type { AttachmentRecord, CurriedImageStudioSelectors } from '../types/wordpress.d';
import type { RevisionNavigationDirection } from '../utils/tracking';

const ABILITY_NAME = 'image-studio/navigate-revision';

const DIRECTIONS: RevisionNavigationDirection[] = [ 'previous', 'next', 'original' ];

let isRegistered = false;

interface NavigateRevisionAbilityInput {
	direction?: string;
}

export interface NavigateRevisionResult {
	success: true;
	message: string;
	/** 1-based position of the canvas in the revision history after the call, or 0 when it isn't in it. */
	position: number;
	count: number;
}

const MOVED_MESSAGES: Record< RevisionNavigationDirection, string > = {
	previous: 'Went back to the previous version.',
	next: 'Went forward to the next version.',
	original: 'Went back to the original version.',
};

const NO_OP_MESSAGES: Record< RevisionNavigationDirection, string > = {
	previous: 'This is already the first version.',
	next: 'This is already the latest version.',
	original: 'This is already the original version.',
};

function isDirection( direction: unknown ): direction is RevisionNavigationDirection {
	return DIRECTIONS.includes( direction as RevisionNavigationDirection );
}

async function navigateRevision(
	direction: RevisionNavigationDirection
): Promise< NavigateRevisionResult > {
	const storeSelectors = select( imageStudioStore ) as CurriedImageStudioSelectors;
	const originalAttachmentId = storeSelectors.getOriginalAttachmentId();

	const { revisions, currentIndex } = getRevisionHistory(
		{
			originalAttachmentId,
			currentAttachmentId: storeSelectors.getImageStudioAttachmentId(),
			draftIds: storeSelectors.getDraftIds(),
			savedAttachmentIds: storeSelectors.getSavedAttachmentIds(),
			annotatedIds: storeSelectors.getAnnotatedAttachmentIds(),
		},
		( id ) =>
			select( coreStore ).getEntityRecord( 'postType', 'attachment', id ) as
				AttachmentRecord | undefined
	);

	const count = revisions.length;
	const stay = ( message: string ): NavigateRevisionResult => ( {
		success: true,
		message,
		position: currentIndex + 1,
		count,
	} );

	if ( count <= 1 ) {
		return stay( 'There are no other versions of this image yet.' );
	}

	const isOutsideHistory = currentIndex === -1;
	let message = MOVED_MESSAGES[ direction ];
	let targetIndex: number;
	if ( direction === 'previous' ) {
		if ( isOutsideHistory ) {
			return stay(
				'The image on the canvas is not part of the version history, so there is no previous version to go back to.'
			);
		}
		targetIndex = currentIndex - 1;
	} else if ( direction === 'next' ) {
		if ( isOutsideHistory ) {
			message = 'Went to the first version in the history.';
		}
		targetIndex = currentIndex + 1;
	} else {
		const originalIndex = revisions.findIndex(
			( revision ) => revision.id === originalAttachmentId
		);
		targetIndex = originalIndex === -1 ? 0 : originalIndex;
	}

	if ( targetIndex === currentIndex || targetIndex < 0 || targetIndex >= count ) {
		return stay( NO_OP_MESSAGES[ direction ] );
	}

	const target = revisions[ targetIndex ];
	const { updateImageStudioCanvas } = dispatch( imageStudioStore ) as ImageStudioActions;
	await updateImageStudioCanvas( target.url, target.id, false );

	trackImageStudioRevisionNavigated( { direction, source: 'prompt' } );

	return {
		success: true,
		message,
		position: targetIndex + 1,
		count,
	};
}

/**
 * Register the navigate revision ability with WordPress Abilities API
 */
export async function registerNavigateRevisionAbility(): Promise< void > {
	if ( isRegistered ) {
		return;
	}

	try {
		// The 'image-studio' category is registered by registerUpdateCanvasImageAbility,
		// which initializeAbilities() always runs first.
		await registerAbility( {
			name: ABILITY_NAME,
			label: 'Navigate Revision',
			category: 'image-studio',
			description:
				'Move the Image Studio canvas to a version of the image that already exists in this session, without generating a new image. Use it when the user asks to undo, go back, redo, go forward, or revert to the original.',
			input_schema: {
				type: 'object',
				properties: {
					direction: {
						type: 'string',
						enum: DIRECTIONS,
						description:
							'"previous" for the version before the current one, "next" for the version after it, "original" for the first version, keeping all later versions.',
					},
				},
				required: [ 'direction' ],
			},
			callback: async ( input: NavigateRevisionAbilityInput ) => {
				const direction = input?.direction;
				if ( ! isDirection( direction ) ) {
					throw new Error( 'direction must be one of "previous", "next" or "original".' );
				}

				return navigateRevision( direction );
			},
		} );

		isRegistered = true;
	} catch ( error ) {
		const message = error instanceof Error ? error.message : '';
		if ( message.includes( ABILITY_NAME ) && message.includes( 'already registered' ) ) {
			isRegistered = true;
			return;
		}
		throw error;
	}
}
