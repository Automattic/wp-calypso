/**
 * Feedback Input Component
 * Lets users submit text feedback after a thumbs down. Renders as a plain
 * form by default, which consumers such as Image Studio place in their own
 * popovers. With `variant="dialog"` it opens as a dialog over the chat card,
 * so it reads as a step of the rating just taken wherever the rated reply
 * sits in the transcript. That dialog is modal to the card only: its siblings
 * (header, transcript, footer) are made inert while it is open, the rest of
 * the page stays interactive.
 */
import { Button, Spinner, TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './style.scss';

interface Props {
	onSubmit: ( feedbackText: string ) => Promise< void >;
	onCancel: () => void;
	variant?: 'inline' | 'dialog';
}

export default function FeedbackInput( { onSubmit, onCancel, variant = 'inline' }: Props ) {
	const [ feedbackText, setFeedbackText ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ submitSuccess, setSubmitSuccess ] = useState( false );
	const [ submitError, setSubmitError ] = useState< string | null >( null );
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const overlayRef = useRef< HTMLDivElement | null >( null );
	const rootRef = useRef< HTMLDivElement | null >( null );
	const isMountedRef = useRef( true );
	const isDialog = variant === 'dialog';

	useEffect( () => {
		isMountedRef.current = true;
		// Like `useFocusReturn`: whatever had focus when the dialog opened (the
		// thumbs-down button for keyboard users) gets it back on close.
		const opener = isDialog ? document.activeElement : null;
		const overlay = overlayRef.current;
		const siblings = Array.from( overlay?.parentElement?.children ?? [] ).filter(
			( element ) => element !== overlay
		);
		siblings.forEach( ( element ) => element.setAttribute( 'inert', '' ) );
		rootRef.current?.querySelector( 'textarea' )?.focus();

		return () => {
			isMountedRef.current = false;
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}
			siblings.forEach( ( element ) => element.removeAttribute( 'inert' ) );
			if ( opener instanceof HTMLElement && opener.isConnected ) {
				opener.focus( { preventScroll: true } );
			}
		};
	}, [ isDialog ] );

	// While submitting, and once the form gives way to the status message, no
	// control inside the dialog can hold focus; the dialog itself takes it so
	// keyboard events keep reaching it.
	const hasNoControls = isSubmitting || submitSuccess || Boolean( submitError );
	useEffect( () => {
		if ( isDialog && hasNoControls ) {
			rootRef.current?.focus();
		}
	}, [ isDialog, hasNoControls ] );

	const handleSubmit = async () => {
		if ( ! feedbackText.trim() ) {
			return;
		}

		setIsSubmitting( true );

		try {
			await onSubmit( feedbackText.trim() );
			if ( ! isMountedRef.current ) {
				return;
			}
			setFeedbackText( '' );
			setSubmitSuccess( true );

			timeoutRef.current = setTimeout( () => {
				onCancel();
			}, 2000 );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[FeedbackInput] Error submitting feedback:', error );
			if ( ! isMountedRef.current ) {
				return;
			}
			setSubmitError( __( 'Failed to submit feedback. Please try again.', __i18n_text_domain__ ) );

			timeoutRef.current = setTimeout( () => {
				onCancel();
			}, 2000 );
		} finally {
			if ( isMountedRef.current ) {
				setIsSubmitting( false );
			}
		}
	};

	// Dismissal follows the disabled Cancel button: none while a submission is in flight.
	const dismiss = () => {
		if ( ! isSubmitting ) {
			onCancel();
		}
	};

	const handleTextareaKeyDown = ( event: React.KeyboardEvent ) => {
		if ( ( event.metaKey || event.ctrlKey ) && event.key === 'Enter' && ! event.shiftKey ) {
			event.preventDefault();
			handleSubmit();
		} else if ( ! isDialog && event.key === 'Escape' ) {
			event.preventDefault();
			dismiss();
		}
	};

	const handleDialogKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Escape' ) {
			event.preventDefault();
			dismiss();
		}
	};

	const handleBackdropClick = ( event: React.MouseEvent ) => {
		if ( event.target === event.currentTarget ) {
			dismiss();
		}
	};

	// The floating chat starts a drag on any pointerdown outside its
	// non-draggable slots; the dialog is not one of them.
	const handlePointerDown = ( event: React.PointerEvent ) => {
		event.stopPropagation();
	};

	const renderContent = () => {
		if ( submitSuccess ) {
			return (
				<div className="agents-manager-feedback-input__success" role="status">
					{ __( 'Feedback submitted, thank you!', __i18n_text_domain__ ) }
				</div>
			);
		}

		if ( submitError ) {
			return (
				<div className="agents-manager-feedback-input__error" role="alert">
					{ submitError }
				</div>
			);
		}

		return (
			<>
				<TextareaControl
					label={ __( 'What could be improved?', __i18n_text_domain__ ) }
					value={ feedbackText }
					onChange={ ( value: string ) => setFeedbackText( value ) }
					onKeyDown={ handleTextareaKeyDown }
					placeholder={ __(
						'Help us understand what you expected or what went wrong.',
						__i18n_text_domain__
					) }
					rows={ 3 }
					disabled={ isSubmitting }
				/>
				<div className="agents-manager-feedback-input__actions">
					<Button variant="tertiary" onClick={ onCancel } disabled={ isSubmitting }>
						{ __( 'Cancel', __i18n_text_domain__ ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleSubmit }
						disabled={ ! feedbackText.trim() || isSubmitting }
					>
						{ isSubmitting && <Spinner className="agents-manager-feedback-input__spinner" /> }
						{ isSubmitting
							? __( 'Submitting…', __i18n_text_domain__ )
							: __( 'Submit', __i18n_text_domain__ ) }
					</Button>
				</div>
			</>
		);
	};

	if ( ! isDialog ) {
		return (
			<div ref={ rootRef } className="agents-manager-feedback-input">
				<div className="agents-manager-feedback-input__inner">{ renderContent() }</div>
			</div>
		);
	}

	return (
		// The backdrop is a click target for dismissal, not a control; the dialog inside is the focus surface.
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div
			ref={ overlayRef }
			className="agents-manager-feedback-overlay"
			onClick={ handleBackdropClick }
			onPointerDown={ handlePointerDown }
		>
			{ /* Escape is handled on the dialog itself, as the dialog pattern expects. */ }
			{ /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */ }
			<div
				ref={ rootRef }
				className="agents-manager-feedback-input"
				role="dialog"
				aria-label={ __( 'Send feedback', __i18n_text_domain__ ) }
				tabIndex={ -1 }
				onKeyDown={ handleDialogKeyDown }
			>
				<div className="agents-manager-feedback-input__inner">{ renderContent() }</div>
			</div>
		</div>
	);
}
