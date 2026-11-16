/**
 * Revision Navigator Component
 *
 * Displays navigation controls for browsing through revision images.
 * Shows current position (e.g., "5/5") with left/right chevron buttons.
 */
import { Button } from '@wordpress/components';
import { useKeyboardShortcut } from '@wordpress/compose';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { store as imageStudioStore } from '../../store';
import { getRevisionHistory } from '../../utils/revision-history';
import { trackImageStudioRevisionNavigated } from '../../utils/tracking';
import type { ImageStudioActions } from '../../store';
import type { AttachmentRecord } from '../../types/wordpress.d';
import './style.scss';

export const RevisionNavigator = () => {
	const { draftIds, savedAttachmentIds, currentAttachmentId, originalAttachmentId, annotatedIds } =
		useSelect( ( select ) => {
			const selectors = select( imageStudioStore );
			return {
				draftIds: selectors.getDraftIds(),
				savedAttachmentIds: selectors.getSavedAttachmentIds(),
				currentAttachmentId: selectors.getImageStudioAttachmentId(),
				originalAttachmentId: selectors.getOriginalAttachmentId(),
				annotatedIds: selectors.getAnnotatedAttachmentIds(),
			};
		}, [] );

	const { updateImageStudioCanvas } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const {
		revisions: images,
		currentIndex,
		canGoBack,
		canGoForward,
	} = useSelect(
		( select ) =>
			getRevisionHistory(
				{
					originalAttachmentId,
					currentAttachmentId,
					draftIds,
					savedAttachmentIds,
					annotatedIds,
				},
				( id ) =>
					select( coreStore ).getEntityRecord( 'postType', 'attachment', id ) as
						AttachmentRecord | undefined
			),
		[ originalAttachmentId, currentAttachmentId, draftIds, savedAttachmentIds, annotatedIds ]
	);

	const setCurrentImage = useCallback(
		( index: number ) => {
			updateImageStudioCanvas( images[ index ].url, images[ index ].id, false );
		},
		[ images, updateImageStudioCanvas ]
	);

	const goToPrevious = useCallback(
		( source: 'button' | 'keyboard' ) => {
			if ( currentIndex > 0 ) {
				setCurrentImage( currentIndex - 1 );
				trackImageStudioRevisionNavigated( { direction: 'previous', source } );
			}
		},
		[ currentIndex, setCurrentImage ]
	);

	const goToNext = useCallback(
		( source: 'button' | 'keyboard' ) => {
			if ( currentIndex < images.length - 1 ) {
				setCurrentImage( currentIndex + 1 );
				trackImageStudioRevisionNavigated( { direction: 'next', source } );
			}
		},
		[ currentIndex, images.length, setCurrentImage ]
	);

	const disablePrev = ! canGoBack;
	const disableNext = ! canGoForward;

	useKeyboardShortcut( 'left', () => goToPrevious( 'keyboard' ), {
		isDisabled: disablePrev,
	} );

	useKeyboardShortcut( 'right', () => goToNext( 'keyboard' ), {
		isDisabled: disableNext,
	} );

	// Don't render if:
	// - No revisions available
	// - Only one revision (no navigation needed)
	// - Current attachment is not in the revisions list (e.g., viewing original)
	if ( disablePrev && disableNext ) {
		return null;
	}

	return (
		<div className="canvas-controls__revision-navigator">
			<Button
				icon={ chevronLeft }
				onClick={ () => goToPrevious( 'button' ) }
				disabled={ disablePrev }
				className="canvas-controls__nav-button"
				aria-label={ __( 'Previous revision', __i18n_text_domain__ ) }
				label={ __( 'Previous revision ←', __i18n_text_domain__ ) }
			/>
			<span className="canvas-controls__nav-text">
				{ currentIndex + 1 } / { images.length }
			</span>
			<Button
				icon={ chevronRight }
				onClick={ () => goToNext( 'button' ) }
				disabled={ disableNext }
				className="canvas-controls__nav-button"
				aria-label={ __( 'Next revision', __i18n_text_domain__ ) }
				label={ __( 'Next revision →', __i18n_text_domain__ ) }
			/>
		</div>
	);
};
