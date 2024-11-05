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
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import useSubmitContactSupport from './use-submit-contact-support';

import './style.scss';

type Props = {
	show: boolean;
	onClose?: () => void;
	defaultMessage?: string;
	defaultProduct?: string;
};

const DEFAULT_MESSAGE_VALUE = '';
const DEFAULT_PRODUCT_VALUE = 'a4a';

export default function UserContactSupportModalForm( {
	show,
	onClose,
	defaultMessage = DEFAULT_MESSAGE_VALUE,
	defaultProduct = DEFAULT_PRODUCT_VALUE,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const user = useSelector( getCurrentUser );
	const agency = useSelector( getActiveAgency );

	const [ name, setName ] = useState( user?.display_name );
	const [ email, setEmail ] = useState( user?.email );
	const [ product, setProduct ] = useState( defaultProduct );
	const [ pressableContactType, setPressableContactType ] = useState( 'sales' );
	const [ site, setSite ] = useState( '' );
	const [ message, setMessage ] = useState( defaultMessage );

	const isPressableSelected = product === 'pressable';
	const isClient = isClientView();
	const hasCompletedForm =
		!! message && !! name && !! email && !! product && ( !! agency || isClient );

	const { isSubmitting, submit, isSubmissionSuccessful } = useSubmitContactSupport();

	const resetForm = useCallback( () => {
		setMessage( defaultMessage );
		setProduct( defaultProduct );
	}, [ defaultMessage, defaultProduct ] );

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

	const onPressableContactTypeChange: FormEventHandler = useCallback(
		( event: ChangeEvent< HTMLSelectElement > ) => {
			setPressableContactType( event.currentTarget.value );
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

		const pressable_id = agency?.third_party?.pressable?.pressable_id;

		const formData = {
			message,
			name,
			email,
			product,
			...( site && { site } ),
			...( pressableContactType && { contact_type: pressableContactType } ),
			...( pressable_id && { pressable_id } ),
		};

		submit( formData );
	}, [
		hasCompletedForm,
		dispatch,
		message,
		submit,
		name,
		email,
		product,
		site,
		pressableContactType,
		agency,
	] );

	useEffect( () => {
		if ( show ) {
			dispatch( recordTracksEvent( 'calypso_a4a_user_contact_support_form_open' ) );
		}
	}, [ dispatch, show ] );

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

				{ isPressableSelected && (
					<>
						<FormFieldset>
							<FormLabel htmlFor="product">
								{ translate( 'Would you like help with Pressable sales or support?' ) }
							</FormLabel>
							<FormSelect
								name="pressable_contact"
								id="product"
								value={ pressableContactType }
								onChange={ onPressableContactTypeChange }
							>
								<option value="sales">{ translate( 'Sales' ) }</option>
								<option value="support">{ translate( 'Support' ) }</option>
							</FormSelect>
						</FormFieldset>
						<div className="form-field-description">
							{ translate(
								'Your request will be routed directly to a Pressable support specialist to chat about your needs.'
							) }
						</div>
					</>
				) }

				<FormFieldset>
					<FormLabel htmlFor="message">{ translate( 'How can we help?' ) }</FormLabel>
					<FormTextarea
						name="message"
						id="message"
						placeholder={
							isPressableSelected
								? translate(
										'Please provide the team with a detailed explanation of the issue you’re facing, including steps to reproduce the issue on our end and/or URLs. Providing these details will greatly help us with your support request.'
								  )
								: translate( 'Add your message here' )
						}
						value={ message }
						onChange={ onMessageChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_user_contact_support_form_message_click' ) )
						}
					/>
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
