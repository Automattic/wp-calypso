import { Button, FormLabel } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, FormEventHandler, useCallback, useEffect, useState } from 'react';
import { isClientView } from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/lib/is-client-view';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import useSubmitContactSupport from './use-submit-contact-support';

import './style.scss';

type Props = {
	show: boolean;
	onClose?: () => void;
	defaultMessage?: string;
};

const DEFAULT_MESSAGE_VALUE = '';
const DEFAULT_PRODUCT_VALUE = 'a4a';

export default function UserContactSupportModalForm( {
	show,
	onClose,
	defaultMessage = DEFAULT_MESSAGE_VALUE,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const user = useSelector( getCurrentUser );

	const [ name, setName ] = useState( user?.display_name );
	const [ email, setEmail ] = useState( user?.email );
	const [ product, setProduct ] = useState( DEFAULT_PRODUCT_VALUE );
	const [ site, setSite ] = useState( '' );
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

		dispatch( recordTracksEvent( 'calypso_a4a_user_contact_support_form_close' ) );
	}, [ dispatch, onClose ] );

	useEffect( () => {
		if ( isSubmissionSuccessful ) {
			dispatch(
				successNotice( translate( 'Thank you! Support request submitted.' ), {
					id: 'submit-product-contact-support-success',
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

	const onSiteChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setSite( event.currentTarget.value );
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
			recordTracksEvent( 'calypso_a4a_user_contact_support_form_submit', {
				message,
			} )
		);

		submit( { message, name, email, product, site } );
	}, [ hasCompletedForm, dispatch, message, submit, name, email, product, site ] );

	useEffect( () => {
		if ( show ) {
			dispatch( recordTracksEvent( 'calypso_a4a_user_contact_support_form_open' ) );
		}
	}, [ dispatch, show ] );

	const isClient = isClientView();

	if ( ! show ) {
		return null;
	}

	return (
		<Modal
			className="a4a-contact-support-modal-form"
			onRequestClose={ onModalClose }
			__experimentalHideHeader
		>
			<div className="a4a-contact-support-modal-form__main">
				<Button
					className="a4a-contact-support-modal-form__close-button"
					plain
					onClick={ onModalClose }
					aria-label={ translate( 'Close' ) }
				>
					<Icon size={ 24 } icon={ close } />
				</Button>

				<h1 className="a4a-contact-support-modal-form__title">
					{ isClient ? translate( 'Contact support' ) : translate( 'Contact sales & support' ) }
				</h1>

				<FormFieldset>
					<FormLabel htmlFor="name">{ translate( 'Your name' ) }</FormLabel>
					<FormTextInput
						name="name"
						id="name"
						placeholder={ translate( 'Your name' ) }
						value={ name }
						onChange={ onNameChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_user_contact_support_form_name_click' ) )
						}
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="email">{ translate( 'Email address' ) }</FormLabel>
					<FormTextInput
						name="email"
						id="email"
						placeholder={ translate( 'Your email' ) }
						value={ email }
						onChange={ onEmailChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_user_contact_support_form_email_click' ) )
						}
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="site">{ translate( 'Related site' ) }</FormLabel>
					<FormTextInput
						name="site"
						id="site"
						placeholder={ translate( 'Add site if necessary' ) }
						value={ site }
						onChange={ onSiteChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_user_contact_support_form_site_click' ) )
						}
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="product">
						{ translate( 'What Automattic product would you like help with?' ) }
					</FormLabel>
					<FormSelect name="product" id="product" value={ product } onChange={ onProductChange }>
						<option value="a4a">{ translate( 'Automattic for Agencies' ) }</option>
						<option value="woo">{ translate( 'Woo' ) }</option>
						<option value="wpcom">{ translate( 'WordPress.com' ) }</option>
						<option value="jetpack">{ translate( 'Jetpack' ) }</option>
						<option value="pressable">{ translate( 'Pressable' ) }</option>
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="message">{ translate( 'How can we help?' ) }</FormLabel>
					{ ! isPressableSelected ? (
						<FormTextarea
							name="message"
							id="message"
							placeholder="Add your message here"
							value={ message }
							onChange={ onMessageChange }
							onClick={ () =>
								dispatch(
									recordTracksEvent( 'calypso_a4a_user_contact_support_form_message_click' )
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

			<div className="a4a-contact-support-modal-form__footer">
				<Button
					busy={ isSubmitting }
					className="a4a-contact-support-modal-form__footer-submit"
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
