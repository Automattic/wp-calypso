/**
 * External dependencies
 */
// import config from '@automattic/calypso-config';
import { TextareaControl, Button, PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
// import { useDispatch, useSelect as useSelector } from 'react-redux';
/**
 * Internal dependencies
 */
// import FormButton from 'calypso/components/forms/form-button';
// import FormLabel from 'calypso/components/forms/form-label';
// import FormTextarea from 'calypso/components/forms/form-textarea';
// import wpcom from 'calypso/lib/wp';
// import HelpContactConfirmation from 'calypso/me/help/help-contact-confirmation';
// import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
// import { errorNotice } from 'calypso/state/notices/actions';
// import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function FseBetaFeedbackForm() {
	const { __, _x } = useI18n();

	// const selectedSite = useSelector( getSelectedSite );
	// const currentUserLocale = useSelector( getCurrentUserLocale );
	// const dispatch = useDispatch();

	const [ confirmation, setConfirmation ] = useState( null );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ message, setMessage ] = useState( '' );

	// @see client/me/help/help-contact/index.jsx
	// const submitKayakoTicket = () => {
	// 	setIsSubmitting( true );

	// 	const kayakoMessage = `Site: ${ selectedSite ? selectedSite.URL : 'N/A' }\n\n${ message }`;

	// 	wpcom
	// 		.undocumented()
	// 		.submitKayakoTicket(
	// 			'[Dotcom FSE Beta]',
	// 			kayakoMessage,
	// 			currentUserLocale,
	// 			config( 'client_slug' ),
	// 			false,
	// 			( error ) => {
	// 				if ( error ) {
	// 					dispatch( errorNotice( error.message ) );
	// 					setIsSubmitting( false );
	// 					return;
	// 				}

	// 				setIsSubmitting( false );
	// 				setConfirmation( {
	// 					title: __( 'Got it!', 'full-site-editing' ),
	// 					message: __(
	// 						"We've received your feedback. Thank you for helping us making WordPress.com awesome!",
	// 						'full-site-editing'
	// 					),
	// 				} );
	// 			}
	// 		);
	// };

	// if ( confirmation ) {
	// 	return <HelpContactConfirmation { ...confirmation } />;
	// }

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
				// onClick={ submitKayakoTicket }
			>
				{ isSubmitting
					? __( 'Sending…', 'full-site-editing' )
					: _x( 'Send', 'verb: imperative', 'full-site-editing' ) }
			</Button>
		</PanelBody>
	);
}
