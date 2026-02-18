/**
 * Feedback Input Component
 * Allows users to submit text feedback after clicking thumbs down.
 * Adapted from big-sky-plugin's FeedbackInput component.
 */
import { Button, Spinner, TextareaControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './style.scss';

interface FeedbackInputProps {
	onSubmit: ( feedbackText: string ) => Promise< void >;
	onCancel: () => void;
}

export default function FeedbackInput( { onSubmit, onCancel }: FeedbackInputProps ) {
	const [ feedbackText, setFeedbackText ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ submitSuccess, setSubmitSuccess ] = useState( false );
	const [ submitError, setSubmitError ] = useState< string | null >( null );
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const containerRef = useRef< HTMLDivElement | null >( null );

	useEffect( () => {
		containerRef.current?.querySelector( 'textarea' )?.focus();
		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
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
			setSubmitError(
				__( 'Failed to submit feedback. Please try again.', '__i18n_text_domain__' )
			);

			timeoutRef.current = setTimeout( () => {
				onCancel();
			}, 2000 );
		} finally {
			setIsSubmitting( false );
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( ( event.metaKey || event.ctrlKey ) && event.key === 'Enter' && ! event.shiftKey ) {
			event.preventDefault();
			handleSubmit();
		}
		if ( event.key === 'Escape' ) {
			onCancel();
		}
	};

	if ( submitSuccess ) {
		return (
			<div className="agents-manager-feedback-input-container">
				<div className="agents-manager-feedback-input">
					<div className="agents-manager-feedback-input__success">
						{ __( 'Feedback submitted, thank you!', '__i18n_text_domain__' ) }
					</div>
				</div>
			</div>
		);
	}

	if ( submitError ) {
		return (
			<div className="agents-manager-feedback-input-container">
				<div className="agents-manager-feedback-input">
					<div className="agents-manager-feedback-input__error">{ submitError }</div>
				</div>
			</div>
		);
	}

	return (
		<div className="agents-manager-feedback-input-container">
			<div className="agents-manager-feedback-input" ref={ containerRef }>
				<TextareaControl
					label={ __( 'What could be improved?', '__i18n_text_domain__' ) }
					value={ feedbackText }
					onChange={ ( value: string ) => setFeedbackText( value ) }
					onKeyDown={ handleKeyDown }
					placeholder={ __(
						'Help us understand what you expected or what went wrong.',
						'__i18n_text_domain__'
					) }
					rows={ 3 }
					disabled={ isSubmitting }
				/>
				<div className="agents-manager-feedback-input__actions">
					<Button variant="tertiary" onClick={ onCancel } disabled={ isSubmitting }>
						{ __( 'Cancel', '__i18n_text_domain__' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleSubmit }
						disabled={ ! feedbackText.trim() || isSubmitting }
					>
						{ isSubmitting && (
							<Spinner
								style={ {
									height: '16px',
									width: '16px',
								} }
							/>
						) }
						{ isSubmitting
							? __( 'Submitting\u2026', '__i18n_text_domain__' )
							: __( 'Submit', '__i18n_text_domain__' ) }
					</Button>
				</div>
			</div>
		</div>
	);
}
