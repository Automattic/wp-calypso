import page from '@automattic/calypso-router';
import { Button, FormLabel, Tooltip } from '@automattic/components';
import { Icon, warning } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useShowFeedback from 'calypso/a8c-for-agencies/components/a4a-feedback/hooks/use-show-a4a-feedback';
import { A4A_REFERRALS_DASHBOARD } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { REFERRAL_EMAIL_QUERY_PARAM_KEY } from 'calypso/a8c-for-agencies/constants';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import MissingPaymentSettingsNotice from '../../referrals/common/missing-payment-settings-notice';
import useGetTipaltiPayee from '../../referrals/hooks/use-get-tipalti-payee';
import withMarketplaceType, {
	MARKETPLACE_TYPE_SESSION_STORAGE_KEY,
	MARKETPLACE_TYPE_REGULAR,
} from '../hoc/with-marketplace-type';
import useRequestClientPaymentMutation from '../hooks/use-request-client-payment-mutation';
import useShoppingCart from '../hooks/use-shopping-cart';
import NoticeSummary from './notice-summary';
import type { ShoppingCartItem } from '../types';

interface Props {
	checkoutItems: ShoppingCartItem[];
}

type ValidationState = {
	email?: string;
};

function RequestClientPayment( { checkoutItems }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const user = useSelector( getCurrentUser );

	const isUserUnverified = ! user?.email_verified;

	const [ email, setEmail ] = useState( '' );
	const [ message, setMessage ] = useState( '' );
	const [ validationError, setValidationError ] = useState< ValidationState >( {} );
	const [ tipaltiActionRequiredVisible, setTipaltiActionRequiredVisible ] = useState( false );

	const ctaButtonRef = useRef< HTMLButtonElement >( null );

	const [ showVerifyAccountToolip, setShowVerifyAccountToolip ] = useState( false );

	const { onClearCart } = useShoppingCart();

	const onEmailChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		setEmail( event.currentTarget.value );
		if ( validationError.email ) {
			setValidationError( { email: undefined } );
		}
	};

	const onMessageChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setMessage( event.currentTarget.value );
	}, [] );

	const { mutate: requestPayment, isPending, isSuccess } = useRequestClientPaymentMutation();

	const hasCompletedForm = !! email && !! message;

	const productIds = checkoutItems.map( ( item ) => item.product_id ).join( ',' );

	const licenses = useMemo(
		() =>
			checkoutItems
				.filter( ( item ) => item.licenseId )
				.map( ( item ) => ( {
					product_id: item.product_id,
					license_id: item.licenseId as number,
				} ) ),
		[ checkoutItems ]
	);

	const { data: tipaltiData } = useGetTipaltiPayee();

	useEffect( () => {
		if ( tipaltiData && ! tipaltiData.IsPayable ) {
			setTipaltiActionRequiredVisible( true );
		}
	}, [ tipaltiData ] );

	const handleRequestPayment = useCallback( () => {
		if ( ! hasCompletedForm ) {
			return;
		}
		if ( ! emailValidator.validate( email ) ) {
			setValidationError( { email: translate( 'Please provide correct email address' ) } );
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_referral_checkout_request_payment_click' )
		);
		requestPayment(
			{
				client_email: email,
				client_message: message,
				product_ids: productIds,
				licenses: licenses,
			},
			{
				onError: ( error ) => {
					dispatch(
						errorNotice(
							error.code === 'cannot_refer_to_client'
								? translate(
										'Referring products to your own company is not allowed and against our {{a}}terms of service{{/a}}.',
										{
											components: {
												a: (
													<a
														href="https://automattic.com/for-agencies/program-incentives/"
														target="_blank"
														rel="noopener noreferrer"
													/>
												),
											},
										}
								  )
								: error.message
						)
					);
				},
			}
		);
	}, [
		dispatch,
		email,
		hasCompletedForm,
		licenses,
		message,
		productIds,
		requestPayment,
		translate,
	] );

	const { isFeedbackShown } = useShowFeedback( 'referral-complete' );

	useEffect( () => {
		if ( isSuccess && !! email ) {
			sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, MARKETPLACE_TYPE_REGULAR );
			page.redirect(
				! isFeedbackShown
					? addQueryArgs( A4A_REFERRALS_DASHBOARD, {
							args: { email },
					  } ) + '#feedback'
					: addQueryArgs( A4A_REFERRALS_DASHBOARD, { [ REFERRAL_EMAIL_QUERY_PARAM_KEY ]: email } )
			);
			setEmail( '' );
			setMessage( '' );
			onClearCart();
		}
	}, [ email, isSuccess, onClearCart, isFeedbackShown ] );

	return (
		<>
			{ tipaltiActionRequiredVisible && (
				<div className="checkout__tipalti-action-required-notice">
					<MissingPaymentSettingsNotice
						onClose={ () => setTipaltiActionRequiredVisible( false ) }
					/>
				</div>
			) }
			<div className="checkout__client-referral-form">
				<FormFieldset>
					<FormLabel htmlFor="email">{ translate( 'Client’s email address' ) }</FormLabel>
					<FormTextInput
						name="email"
						id="email"
						value={ email }
						onChange={ onEmailChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_client_referral_form_email_click' ) )
						}
						disabled={ ! tipaltiData?.IsPayable }
					/>
					<div
						className={ clsx( 'checkout__client-referral-form-footer-error', {
							hidden: ! validationError?.email,
						} ) }
						role="alert"
					>
						{ validationError.email }
					</div>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="message">{ translate( 'Custom message' ) }</FormLabel>
					<FormTextarea
						name="message"
						id="message"
						placeholder="Send a message to your client about this request for payment."
						value={ message }
						onChange={ onMessageChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_client_referral_form_message_click' ) )
						}
						disabled={ ! tipaltiData?.IsPayable }
					/>
				</FormFieldset>
			</div>

			<NoticeSummary type="request-client-payment" />

			<div
				className="checkout__aside-actions"
				role="button"
				tabIndex={ 0 }
				onMouseEnter={ () => setShowVerifyAccountToolip( true ) }
				onMouseLeave={ () => setShowVerifyAccountToolip( false ) }
				onTouchStart={ () => setShowVerifyAccountToolip( true ) }
			>
				<Button
					ref={ ctaButtonRef }
					primary
					onClick={ handleRequestPayment }
					disabled={ ! hasCompletedForm || isUserUnverified }
					busy={ isPending }
				>
					{ translate( 'Request payment from client' ) }
					{ isUserUnverified && <Icon icon={ warning } /> }
				</Button>

				<Tooltip
					className="checkout__verify-account-tooltip"
					context={ ctaButtonRef.current }
					isVisible={ showVerifyAccountToolip && isUserUnverified }
					position="bottom"
				>
					{ translate(
						"Please verify your {{a}}account's email{{/a}} in order to begin referring products to clients.",
						{
							components: {
								a: <a href="https://wordpress.com/me" target="_blank" rel="noopener noreferrer" />,
							},
						}
					) }
				</Tooltip>
			</div>

			<div className="checkout__summary-notice-item">
				{ translate(
					'{{b}}Important:{{/b}} Your referral order link is only valid for {{u}}7 days{{/u}}. Please notify your client to complete the payment within this timeframe to avoid expiration.',
					{
						components: {
							b: <b />,
							u: <u />,
						},
					}
				) }
			</div>
		</>
	);
}

export default withMarketplaceType( RequestClientPayment );
