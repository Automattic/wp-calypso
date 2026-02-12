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
import { useCallback, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { store as imageStudioStore } from '../../store';
import type { ImageStudioActions } from '../../store';
import './style.scss';

interface ImageData {
	id: number;
	url: string;
	date: string;
}

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

	const images = useSelect(
		( select ) => {
			const allAttachmentIds = new Set< number | null >( [
				originalAttachmentId,
				currentAttachmentId,
				...draftIds,
				...savedAttachmentIds,
			] );

			const attachments = Array.from( allAttachmentIds )
				.map( ( id ) => {
					if ( ! id ) {
						return null;
					}

					// Exclude annotated images
					if ( annotatedIds.includes( id ) ) {
						return null;
					}

					const attachment = select( coreStore ).getEntityRecord(
						'postType',
						'attachment',
						id
					) as any;

					if ( ! attachment ) {
						return null;
					}

					return {
						id: attachment.id,
						url: attachment.source_url,
						date: attachment.date,
					} as ImageData;
				} )
				.filter( ( item ) => !! item )
				.sort( ( a, b ) => new Date( a.date ).getTime() - new Date( b.date ).getTime() );

			return attachments;
		},
		[ originalAttachmentId, currentAttachmentId, draftIds, savedAttachmentIds, annotatedIds ]
	);

	const currentIndex = useMemo( () => {
		return images.findIndex( ( image ) => image.id === currentAttachmentId );
	}, [ images, currentAttachmentId ] );

	const setCurrentImage = useCallback(
		( index: number ) => {
			updateImageStudioCanvas( images[ index ].url, images[ index ].id, false );
		},
		[ images, updateImageStudioCanvas ]
	);

	const handlePrevious = useCallback( () => {
		if ( currentIndex > 0 ) {
			setCurrentImage( currentIndex - 1 );
		}
	}, [ currentIndex, setCurrentImage ] );

	const handleNext = useCallback( () => {
		if ( currentIndex < images.length - 1 ) {
			setCurrentImage( currentIndex + 1 );
		}
	}, [ currentIndex, images.length, setCurrentImage ] );

	const disablePrev = images.length <= 1 || currentIndex <= 0;
	const disableNext = images.length <= 1 || currentIndex >= images.length - 1;

	useKeyboardShortcut( 'left', handlePrevious, {
		isDisabled: disablePrev,
	} );

	useKeyboardShortcut( 'right', handleNext, {
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
				onClick={ handlePrevious }
				disabled={ disablePrev }
				className="canvas-controls__nav-button"
				aria-label={ __( 'Previous revision', 'big-sky' ) }
				label={ __( 'Previous revision ←', 'big-sky' ) }
			/>
			<span className="canvas-controls__nav-text">
				{ currentIndex + 1 } / { images.length }
			</span>
			<Button
				icon={ chevronRight }
				onClick={ handleNext }
				disabled={ disableNext }
				className="canvas-controls__nav-button"
				aria-label={ __( 'Next revision', 'big-sky' ) }
				label={ __( 'Next revision →', 'big-sky' ) }
			/>
		</div>
	);
};
