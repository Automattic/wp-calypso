/* global MessageChannel */
import { TextareaControl, Button, PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
// import { useI18n } from '@wordpress/react-i18n';
import { __, _x } from '@wordpress/i18n';

export default function FseBetaFeedbackForm( { calypsoPort } ) {
	// const { __, _x } = useI18n();

	const [ confirmation, setConfirmation ] = useState( null );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ message, setMessage ] = useState( '' );

	const submitFeedback = () => {
		setIsSubmitting( true );

		const { port1, port2 } = new MessageChannel();
		calypsoPort.postMessage( { action: 'feedback-goo', payload: message }, [ port2 ] );

		port1.onmessage = ( { data } ) => {
			setIsSubmitting( false );

			if ( 'success' === data ) {
				setConfirmation( {
					title: __( 'Got it!' ),
					message: __(
						"We've received your feedback. Thank you for helping us making WordPress.com awesome!"
					),
					isError: false,
				} );
				setMessage( '' );
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
					id="message"
					// name="message"
					onChange={ setMessage }
					placeholder={ __(
						'How can we improve the site editing experience?',
						'full-site-editing'
					) }
					value={ message }
					label={ __( 'Leave feedback', 'full-site-editing' ) }
					help="bla bla bla help..."
					rows={ 10 }
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
				<PanelBody>
					<h1>{ confirmation.title }</h1>
					<p>{ confirmation.message }</p>
				</PanelBody>
			) }
		</>
	);
}
