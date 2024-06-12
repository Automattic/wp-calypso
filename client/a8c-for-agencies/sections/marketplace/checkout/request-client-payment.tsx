import page from '@automattic/calypso-router';
import { Button, FormLabel } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { A4A_REFERRALS_DASHBOARD } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { REFERRAL_EMAIL_QUERY_PARAM_KEY } from 'calypso/a8c-for-agencies/constants';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import withMarketplaceType, {
	MARKETPLACE_TYPE_SESSION_STORAGE_KEY,
	MARKETPLACE_TYPE_REGULAR,
} from '../hoc/with-marketplace-type';
import useRequestClientPaymentMutation from '../hooks/use-request-client-payment-mutation';
import useShoppingCart from '../hooks/use-shopping-cart';
import type { ShoppingCartItem } from '../types';

interface Props {
	checkoutItems: ShoppingCartItem[];
}

function RequestClientPayment( { checkoutItems }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ email, setEmail ] = useState( '' );
	const [ message, setMessage ] = useState( '' );

	const { onClearCart } = useShoppingCart();

	const onEmailChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setEmail( event.currentTarget.value );
	}, [] );

	const onMessageChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setMessage( event.currentTarget.value );
	}, [] );

	const { mutate: requestPayment, isPending, isSuccess } = useRequestClientPaymentMutation();

	const hasCompletedForm = !! email && !! message;

	const learnMoreLink = ''; //FIXME: Add link for A4A;

	const productIds = checkoutItems.map( ( item ) => item.product_id ).join( ',' );

	const handleRequestPayment = useCallback( () => {
		if ( ! hasCompletedForm ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_referral_checkout_request_payment_click' )
		);
		requestPayment( { client_email: email, client_message: message, product_ids: productIds } );
	}, [ dispatch, email, hasCompletedForm, message, productIds, requestPayment ] );

	const onClickLearnMore = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_referral_checkout_learn_more_click' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( isSuccess && !! email ) {
			sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, MARKETPLACE_TYPE_REGULAR );
			page.redirect(
				addQueryArgs( A4A_REFERRALS_DASHBOARD, { [ REFERRAL_EMAIL_QUERY_PARAM_KEY ]: email } )
			);
			setEmail( '' );
			setMessage( '' );
			onClearCart();
		}
	}, [ email, isSuccess, onClearCart ] );

	return (
		<>
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
					/>
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
					/>
				</FormFieldset>
			</div>
			<div className="checkout__aside-actions">
				<Button
					primary
					onClick={ handleRequestPayment }
					disabled={ ! hasCompletedForm }
					busy={ isPending }
				>
					{ translate( 'Request payment from client' ) }
				</Button>
			</div>

			<div className="checkout__summary-notice margin-top">
				{ translate(
					'The client will be billed at the end of every month. The first month may be less than the above amount. {{a}}Learn more{{/a}}',
					{
						components: {
							a: (
								<a
									href={ learnMoreLink }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ onClickLearnMore }
								/>
							),
						},
					}
				) }
			</div>
		</>
	);
}

export default withMarketplaceType( RequestClientPayment );
