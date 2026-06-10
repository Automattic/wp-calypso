/**
 * Annotate mode for the one-pager viewer, modeled on Studio Code's
 * `/annotate` feedback loop: click an element on a rendered page, leave a
 * short note in place, repeat, then send all notes to the refine agent in
 * one batch. Wraps `PdfViewer` and draws pins / highlight / comment form
 * inside each page frame via `renderPageOverlay`, so everything tracks the
 * responsive page scale for free.
 */
import { Button, TextareaControl } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useAnnotationInspector, type AnnotationTarget } from './annotation-inspector';
import PdfViewer, { type PdfViewerPage } from './pdf-viewer';
import type { ReactNode } from 'react';

import './annotation-viewer.scss';

export interface PageAnnotation extends AnnotationTarget {
	comment: string;
}

interface CoverNavigation {
	count: number;
	activeIndex: number;
	onSelect: ( idx: number ) => void;
}

interface Props {
	pages: PdfViewerPage[];
	coverNavigation?: CoverNavigation;
	isAnnotating: boolean;
	/** Exit annotate mode without sending; collected notes are discarded. */
	onExit: () => void;
	/** Send the collected notes. The parent also exits annotate mode. */
	onSubmit: ( annotations: PageAnnotation[] ) => void;
}

const toPercent = ( fraction: number ): string => `${ fraction * 100 }%`;

export default function AnnotationViewer( {
	pages,
	coverNavigation,
	isAnnotating,
	onExit,
	onSubmit,
}: Props ) {
	const containerRef = useRef< HTMLDivElement >( null );
	const [ annotations, setAnnotations ] = useState< PageAnnotation[] >( [] );
	const [ pendingPick, setPendingPick ] = useState< AnnotationTarget | null >( null );
	const [ draftComment, setDraftComment ] = useState( '' );

	// Leaving annotate mode always discards in-progress state.
	useEffect( () => {
		if ( ! isAnnotating ) {
			setAnnotations( [] );
			setPendingPick( null );
			setDraftComment( '' );
		}
	}, [ isAnnotating ] );

	const handlePick = useCallback( ( target: AnnotationTarget ) => {
		setPendingPick( target );
		setDraftComment( '' );
	}, [] );

	// Pause inspection while the comment form is open so clicks land on it.
	const hovered = useAnnotationInspector( containerRef, isAnnotating && ! pendingPick, handlePick );

	const cancelPending = useCallback( () => {
		setPendingPick( null );
		setDraftComment( '' );
	}, [] );

	const addPending = useCallback( () => {
		const comment = draftComment.trim();
		if ( ! pendingPick || ! comment ) {
			return;
		}
		setAnnotations( ( current ) => [ ...current, { ...pendingPick, comment } ] );
		cancelPending();
	}, [ pendingPick, draftComment, cancelPending ] );

	// Esc backs out one level: comment form first, then the whole mode.
	useEffect( () => {
		if ( ! isAnnotating ) {
			return;
		}
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key !== 'Escape' ) {
				return;
			}
			event.stopPropagation();
			if ( pendingPick ) {
				cancelPending();
			} else {
				onExit();
			}
		};
		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [ isAnnotating, pendingPick, cancelPending, onExit ] );

	const removeAnnotation = ( index: number ) => {
		setAnnotations( ( current ) => current.filter( ( _, idx ) => idx !== index ) );
	};

	const renderPageOverlay = ( pageNumber: number ): ReactNode => {
		// While the comment form is open the inspector is paused (`hovered` is
		// null), so the picked element keeps the highlight.
		const picked = pendingPick ?? hovered;
		const highlight = picked?.pageNumber === pageNumber ? picked : null;
		// Pins keep their index in the full list: it is both the removal handle
		// and the user-facing note number.
		const pins = annotations
			.map( ( annotation, index ) => ( { annotation, index } ) )
			.filter( ( pin ) => pin.annotation.pageNumber === pageNumber );
		return (
			<div className="a4a-annotation-overlay">
				{ highlight && (
					<div
						className={ clsx( 'a4a-annotation-overlay__highlight', {
							'is-pending': !! pendingPick,
						} ) }
						style={ {
							insetInlineStart: toPercent( highlight.rect.x ),
							insetBlockStart: toPercent( highlight.rect.y ),
							width: toPercent( highlight.rect.width ),
							height: toPercent( highlight.rect.height ),
						} }
					/>
				) }
				{ pins.map( ( { annotation, index } ) => (
					<button
						key={ index }
						type="button"
						className="a4a-annotation-overlay__pin"
						style={ {
							insetInlineStart: toPercent( annotation.rect.x + annotation.rect.width / 2 ),
							insetBlockStart: toPercent( annotation.rect.y ),
						} }
						onClick={ () => removeAnnotation( index ) }
						title={ sprintf(
							/* translators: %s is the note the user left on this element. */
							__( 'Remove note: “%s”' ),
							annotation.comment
						) }
					>
						{ index + 1 }
					</button>
				) ) }
				{ pendingPick?.pageNumber === pageNumber && (
					<div
						className="a4a-annotation-overlay__form"
						style={ {
							insetInlineStart: toPercent( Math.min( pendingPick.rect.x, 0.55 ) ),
							insetBlockStart: toPercent(
								Math.min( pendingPick.rect.y + pendingPick.rect.height, 0.82 )
							),
						} }
					>
						<TextareaControl
							__nextHasNoMarginBottom
							autoFocus // eslint-disable-line jsx-a11y/no-autofocus -- the form opens from an explicit click on the element being annotated.
							label={ __( 'What should change here?' ) }
							hideLabelFromVision
							placeholder={ __( 'e.g. “Make this headline shorter”' ) }
							rows={ 2 }
							value={ draftComment }
							onChange={ setDraftComment }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' && ! event.shiftKey ) {
									event.preventDefault();
									addPending();
								}
							} }
						/>
						<div className="a4a-annotation-overlay__form-actions">
							<Button size="small" variant="tertiary" onClick={ cancelPending }>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								size="small"
								variant="primary"
								disabled={ ! draftComment.trim() }
								onClick={ addPending }
							>
								{ __( 'Add note' ) }
							</Button>
						</div>
					</div>
				) }
			</div>
		);
	};

	return (
		<div
			ref={ containerRef }
			className={ clsx( 'a4a-annotation-viewer', { 'is-annotating': isAnnotating } ) }
		>
			<PdfViewer
				pages={ pages }
				// No cover switching while annotating — the chevrons would
				// swallow picks.
				coverNavigation={ isAnnotating ? undefined : coverNavigation }
				renderPageOverlay={ isAnnotating ? renderPageOverlay : undefined }
			/>
			{ isAnnotating && (
				<div className="a4a-annotation-toolbar">
					<span className="a4a-annotation-toolbar__hint">
						{ annotations.length > 0
							? sprintf(
									/* translators: %d is the number of notes collected so far. */
									_n( '%d note', '%d notes', annotations.length ),
									annotations.length
							  )
							: __( 'Click anything on a page to leave a note. The cover can’t be edited.' ) }
					</span>
					<Button size="small" variant="tertiary" onClick={ onExit }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						size="small"
						variant="primary"
						disabled={ annotations.length === 0 }
						onClick={ () => onSubmit( annotations ) }
					>
						{ __( 'Send to AI' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
