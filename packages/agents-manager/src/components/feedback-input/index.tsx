/**
 * Feedback Input Component
 * Lets users submit text feedback after a thumbs down. Opens as a dialog over
 * the chat so it reads as a step of the rating just taken, wherever the rated
 * reply sits in the transcript.
 */
import { Button, Spinner, TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './style.scss';

interface Props {
	onSubmit: ( feedbackText: string ) => Promise< void >;
	onCancel: () => void;
}

const FOCUSABLE = 'textarea, button:not([disabled])';

export default function FeedbackInput( { onSubmit, onCancel }: Props ) {
	const [ feedbackText, setFeedbackText ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ submitSuccess, setSubmitSuccess ] = useState( false );
	const [ submitError, setSubmitError ] = useState< string | null >( null );
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const dialogRef = useRef< HTMLDivElement | null >( null );
	// The element that opened the dialog (the thumbs-down button) gets focus back on close.
	const openerRef = useRef< Element | null >( null );

	useEffect( () => {
		openerRef.current = document.activeElement;
		dialogRef.current?.querySelector( 'textarea' )?.focus();

		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}

			const opener = openerRef.current;

			if ( opener instanceof HTMLElement && opener.isConnected ) {
				opener.focus( { preventScroll: true } );
			}
		};
	}, [] );

	const handleSubmit = async () => {
		if ( ! feedbackText.trim() ) {
			return;
		}

		setIsSubmitting( true );

		try {
			await onSubmit( feedbackText.trim() );
			setFeedbackText( '' );
			setSubmitSuccess( true );

			timeoutRef.current = setTimeout( () => {
				onCancel();
			}, 2000 );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[FeedbackInput] Error submitting feedback:', error );
			setSubmitError( __( 'Failed to submit feedback. Please try again.', __i18n_text_domain__ ) );

			timeoutRef.current = setTimeout( () => {
				onCancel();
			}, 2000 );
		} finally {
			setIsSubmitting( false );
		}
	};

	const handleTextareaKeyDown = ( event: React.KeyboardEvent ) => {
		if ( ( event.metaKey || event.ctrlKey ) && event.key === 'Enter' && ! event.shiftKey ) {
			event.preventDefault();
			handleSubmit();
		}
	};

	// Escape closes from anywhere in the dialog; Tab cycles inside it.
	const handleDialogKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Escape' ) {
			event.preventDefault();
			onCancel();
			return;
		}

		if ( event.key !== 'Tab' || ! dialogRef.current ) {
			return;
		}

		const focusable = Array.from( dialogRef.current.querySelectorAll< HTMLElement >( FOCUSABLE ) );

		if ( focusable.length === 0 ) {
			return;
		}

		const first = focusable[ 0 ];
		const last = focusable[ focusable.length - 1 ];

		if ( event.shiftKey && document.activeElement === first ) {
			event.preventDefault();
			last.focus();
		} else if ( ! event.shiftKey && document.activeElement === last ) {
			event.preventDefault();
			first.focus();
		}
	};

	const handleBackdropClick = ( event: React.MouseEvent ) => {
		if ( event.target === event.currentTarget ) {
			onCancel();
		}
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
							? __( 'Submitting\u2026', __i18n_text_domain__ )
							: __( 'Submit', __i18n_text_domain__ ) }
					</Button>
				</div>
			</>
		);
	};

	return (
		// The backdrop is a click target for dismissal, not a control; the dialog inside is the focus surface.
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div className="agents-manager-feedback-overlay" onClick={ handleBackdropClick }>
			{ /* Escape and Tab are handled on the dialog itself, as the dialog pattern expects. */ }
			{ /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */ }
			<div
				ref={ dialogRef }
				className="agents-manager-feedback-input"
				role="dialog"
				aria-modal="true"
				aria-label={ __( 'Send feedback', __i18n_text_domain__ ) }
				onKeyDown={ handleDialogKeyDown }
			>
				<div className="agents-manager-feedback-input__inner">{ renderContent() }</div>
			</div>
		</div>
	);
}
