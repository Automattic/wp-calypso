import { Button } from '@wordpress/components';
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
	const [ submitError, setSubmitError ] = useState( false );
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const textareaRef = useRef< HTMLTextAreaElement >( null );

	useEffect( () => {
		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}
		};
	}, [] );

	// Focus textarea on mount
	useEffect( () => {
		textareaRef.current?.focus();
	}, [] );

	const handleSubmit = async () => {
		if ( ! feedbackText.trim() || isSubmitting ) {
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
		} catch {
			setSubmitError( true );

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
			<div className="agents-manager-feedback-input">
				<div className="agents-manager-feedback-input__status agents-manager-feedback-input__status--success">
					{ __( 'Feedback submitted, thank you!', '__i18n_text_domain__' ) }
				</div>
			</div>
		);
	}

	if ( submitError ) {
		return (
			<div className="agents-manager-feedback-input">
				<div className="agents-manager-feedback-input__status agents-manager-feedback-input__status--error">
					{ __( 'Failed to submit feedback. Please try again.', '__i18n_text_domain__' ) }
				</div>
			</div>
		);
	}

	return (
		<div className="agents-manager-feedback-input">
			<label
				className="agents-manager-feedback-input__label"
				htmlFor="agents-manager-feedback-textarea"
			>
				{ __( 'What could be improved?', '__i18n_text_domain__' ) }
			</label>
			<textarea
				ref={ textareaRef }
				id="agents-manager-feedback-textarea"
				className="agents-manager-feedback-input__textarea"
				value={ feedbackText }
				onChange={ ( e ) => setFeedbackText( e.target.value ) }
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
					isBusy={ isSubmitting }
				>
					{ isSubmitting
						? __( 'Submitting\u2026', '__i18n_text_domain__' )
						: __( 'Submit', '__i18n_text_domain__' ) }
				</Button>
			</div>
		</div>
	);
}
