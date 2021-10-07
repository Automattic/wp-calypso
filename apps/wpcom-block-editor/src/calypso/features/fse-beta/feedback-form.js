/* global MessageChannel */
import { TextareaControl, Button, PanelBody, Notice } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';

export default function FseBetaFeedbackForm( { calypsoPort } ) {
	const [ confirmation, setConfirmation ] = useState( null );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ message, setMessage ] = useState( '' );

	useEffect( () => {
		// Reset confirmation if new message is input.
		if ( confirmation && ! confirmation.isError && message.length ) {
			setConfirmation( null );
		}
	}, [ confirmation, message ] );

	const submitFeedback = () => {
		setIsSubmitting( true );

		const { port1, port2 } = new MessageChannel();
		calypsoPort.postMessage( { action: 'sendSiteEditorBetaFeedback', payload: message }, [
			port2,
		] );

		port1.onmessage = ( { data } ) => {
			setIsSubmitting( false );

			if ( 'success' === data ) {
				setMessage( '' );
				setConfirmation( {
					title: __( 'Got it!' ),
					message: __( 'Thank you for helping us make WordPress.com awesome.' ),
					isError: false,
				} );
			} else if ( 'error' === data ) {
				setConfirmation( {
					title: __( 'Error!' ),
					message: __(
						"We're sorry, there was an error in sending your feedback. Please try again later."
					),
					isError: true,
				} );
			}

			port1.close();
		};
	};

	return (
		<>
			<PanelBody>
				<TextareaControl
					disabled={ isSubmitting }
					onChange={ setMessage }
					placeholder={ __(
						'How can we improve your site editing experience?',
						'full-site-editing'
					) }
					value={ message }
					label={ __( 'Leave feedback (optional)', 'full-site-editing' ) }
					rows={ 12 }
				/>
				<Button
					disabled={ isSubmitting || ! message }
					type="button"
					isPrimary
					onClick={ submitFeedback }
				>
					{ isSubmitting
						? __( 'Sending…', 'full-site-editing' )
						: _x( 'Send', 'verb: imperative', 'full-site-editing' ) }
				</Button>
			</PanelBody>
			{ confirmation && (
				<Notice status={ confirmation?.isError ? 'error' : 'success' } isDismissible={ false }>
					<h1>{ confirmation.title }</h1>
					<p>{ confirmation.message }</p>
				</Notice>
			) }
		</>
	);
}
