import { Button, FormLabel } from '@automattic/components';
import { Modal, TextControl } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, FormEventHandler, useCallback, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import useSubmitContactSupport from '../../user-contact-support-modal-form/use-submit-contact-support';

import './style.scss';

type Props = {
	show: boolean;
	onClose?: () => void;
};

const DEFAULT_PRODUCT_VALUE = 'wpcom';

export default function MigrationContactSupportForm( { show, onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const defaultMessage =
		translate( "I'd like to chat more about the migration offer." ) +
		'\n\n' +
		translate( '[your message here]' );

	const user = useSelector( getCurrentUser );

	const [ name, setName ] = useState( user?.display_name );
	const [ email, setEmail ] = useState( user?.email );
	const [ product, setProduct ] = useState( DEFAULT_PRODUCT_VALUE );
	const [ site, setSite ] = useState( 1 );
	const [ message, setMessage ] = useState( defaultMessage );

	const isPressableSelected = product === 'pressable';
	const hasCompletedForm = !! message && !! name && !! email && !! product && ! isPressableSelected;

	const { isSubmitting, submit, isSubmissionSuccessful } = useSubmitContactSupport();

	const resetForm = useCallback( () => {
		setMessage( defaultMessage );
		setProduct( DEFAULT_PRODUCT_VALUE );
	}, [ defaultMessage ] );

	const onModalClose = useCallback( () => {
		onClose?.();

		dispatch( recordTracksEvent( 'calypso_a4a_migration_contact_support_form_close' ) );
	}, [ dispatch, onClose ] );

	useEffect( () => {
		if ( isSubmissionSuccessful ) {
			dispatch(
				successNotice( translate( 'Thanks! Our migration team will get back to you shortly!' ), {
					id: 'submit-migration-contact-support-success',
					duration: 5000,
				} )
			);
			onModalClose();
		}
	}, [ dispatch, isSubmissionSuccessful, onModalClose, translate ] );

	useEffect( () => {
		if ( show ) {
			resetForm();
		}
	}, [ defaultMessage, resetForm, show ] );

	const onNameChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setName( event.currentTarget.value );
	}, [] );

	const onEmailChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setEmail( event.currentTarget.value );
	}, [] );

	const onSiteChange = useCallback( ( value: number ) => {
		setSite( value );
	}, [] );

	const onProductChange: FormEventHandler = useCallback(
		( event: ChangeEvent< HTMLSelectElement > ) => {
			setProduct( event.currentTarget.value );
		},
		[]
	);

	const onMessageChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setMessage( event.currentTarget.value );
	}, [] );

	const onSubmit = useCallback( () => {
		if ( ! hasCompletedForm ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_migration_contact_support_form_submit', {
				message,
			} )
		);

		submit( {
			message,
			name,
			email,
			product,
			no_of_sites: site,
			tags: [ 'a4a_form_dash_migration' ],
		} );
	}, [ hasCompletedForm, dispatch, message, submit, name, email, product, site ] );

	useEffect( () => {
		if ( show ) {
			dispatch( recordTracksEvent( 'calypso_a4a_migration_contact_support_form_open' ) );
		}
	}, [ dispatch, show ] );

	if ( ! show ) {
		return null;
	}

	return (
		<Modal
			className="migration-contact-support-form"
			onRequestClose={ onModalClose }
			__experimentalHideHeader
		>
			<div className="migration-contact-support-form__main">
				<Button
					className="migration-contact-support-form__close-button"
					plain
					onClick={ onModalClose }
					aria-label={ translate( 'Close' ) }
				>
					<Icon size={ 24 } icon={ close } />
				</Button>

				<h1 className="migration-contact-support-form__title">
					{ translate( 'Contact support' ) }
				</h1>

				<FormFieldset>
					<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
					<FormTextInput
						name="name"
						id="name"
						placeholder={ translate( 'Your name' ) }
						value={ name }
						onChange={ onNameChange }
						onClick={ () =>
							dispatch(
								recordTracksEvent( 'calypso_a4a_migration_contact_support_form_name_click' )
							)
						}
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="email">{ translate( 'Email' ) }</FormLabel>
					<FormTextInput
						name="email"
						id="email"
						placeholder={ translate( 'Your email' ) }
						value={ email }
						onChange={ onEmailChange }
						onClick={ () =>
							dispatch(
								recordTracksEvent( 'calypso_a4a_migration_contact_support_form_email_click' )
							)
						}
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="site">{ translate( 'Number of sites' ) }</FormLabel>
					<TextControl
						value={ site }
						onChange={ ( newValue ) => onSiteChange( parseInt( newValue, 10 ) ) }
						type="number"
						min="1"
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="product">
						{ translate( 'What Automattic hosting product are you considering?' ) }
					</FormLabel>
					<FormSelect name="product" id="product" value={ product } onChange={ onProductChange }>
						<option value="wpcom">{ translate( 'WordPress.com' ) }</option>
						<option value="pressable">{ translate( 'Pressable' ) }</option>
						<option value="dont-know">{ translate( "Don't know" ) }</option>
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="message">
						{ translate( 'Is there anything else you would like to share?' ) }
					</FormLabel>
					{ ! isPressableSelected ? (
						<FormTextarea
							name="message"
							id="message"
							placeholder={ translate( 'Add your message here' ) }
							value={ message }
							onChange={ onMessageChange }
							onClick={ () =>
								dispatch(
									recordTracksEvent( 'calypso_a4a_migration_contact_support_form_message_click' )
								)
							}
						/>
					) : (
						<p>
							{ translate(
								'For help with Pressable, please {{a}}login to your Pressable account{{/a}} and request help using the chat widget on the bottom right of the page.',
								{
									components: {
										a: (
											<a
												href="https://my.pressable.com/login"
												target="_blank"
												rel="noreferrer noopener"
											/>
										),
									},
								}
							) }
						</p>
					) }
				</FormFieldset>
			</div>

			<div className="migration-contact-support-form__footer">
				<Button
					busy={ isSubmitting }
					className="migration-contact-support-form__footer-submit"
					primary
					disabled={ ! hasCompletedForm }
					onClick={ onSubmit }
				>
					{ translate( 'Submit' ) }
				</Button>
			</div>
		</Modal>
	);
}
