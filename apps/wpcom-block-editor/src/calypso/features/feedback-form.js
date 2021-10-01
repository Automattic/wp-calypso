import { TextareaControl, Button, PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';

export default function FseBetaFeedbackForm( { submitTicket } ) {
	const { __, _x } = useI18n();

	const [ confirmation, setConfirmation ] = useState( null );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ message, setMessage ] = useState( '' );

	return (
		<PanelBody>
			<TextareaControl
				disabled={ isSubmitting }
				id="message"
				// name="message"
				onChange={ setMessage }
				placeholder={ __( 'How can we improve the site editing experience?', 'full-site-editing' ) }
				value={ message }
				label={ __( 'Leave feedback', 'full-site-editing' ) }
				help="bla bla bla help..."
				rows={ 10 }
			/>
			<Button
				disabled={ isSubmitting || ! message }
				type="button"
				isPrimary
				onClick={ () => submitTicket( message ) }
			>
				{ isSubmitting
					? __( 'Sending…', 'full-site-editing' )
					: _x( 'Send', 'verb: imperative', 'full-site-editing' ) }
			</Button>
		</PanelBody>
	);
}
