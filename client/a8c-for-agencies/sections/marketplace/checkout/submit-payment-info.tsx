import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import {
	A4A_CLIENT_PAYMENT_METHODS_ADD_LINK,
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import usePaymentMethod from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/hooks/use-payment-method';
import A4AFullLogo from 'calypso/assets/images/a8c-for-agencies/a4a-full-logo.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import useSubmitPaymentInfoMutation from '../hooks/use-submit-payment-info-mutation';
import { getClientReferralQueryArgs } from '../lib/get-client-referral-query-args';

export default function SubmitPaymentInfo( { disableButton }: { disableButton?: boolean } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { paymentMethodRequired } = usePaymentMethod();

	const { mutate, isPending, status, error } = useSubmitPaymentInfoMutation();
	const { agencyId, referralId, secret } = getClientReferralQueryArgs();

	const termsLink = 'https://automattic.com/for-agencies/platform-agreement/';

	const handleTermsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_client_checkout_terms_click' ) );
	}, [ dispatch ] );

	const handleSubmitPaymentInfo = useCallback( () => {
		dispatch(
			recordTracksEvent(
				paymentMethodRequired
					? 'calypso_a4a_client_checkout_add_payment_method_click'
					: 'calypso_a4a_client_checkout_submit_payment_info_click'
			)
		);
		if ( paymentMethodRequired ) {
			page.redirect(
				addQueryArgs( A4A_CLIENT_PAYMENT_METHODS_ADD_LINK, {
					return: window.location.pathname + window.location.search,
				} )
			);
			return;
		}
		mutate( {
			agencyId,
			referralId,
			secret,
		} );
	}, [ agencyId, dispatch, mutate, paymentMethodRequired, referralId, secret ] );

	useEffect( () => {
		if ( status === 'success' ) {
			dispatch( recordTracksEvent( 'calypso_a4a_client_checkout_submit_payment_info_success' ) );
			dispatch(
				successNotice( translate( 'Payment information submitted successfully.' ), {
					displayOnNextPage: true,
				} )
			);
			page.redirect( A4A_CLIENT_SUBSCRIPTIONS_LINK );
		}
		if ( status === 'error' ) {
			const alreadySubmittedError = error?.code === 'referral_is_not_pending';
			if ( alreadySubmittedError ) {
				dispatch(
					recordTracksEvent(
						'calypso_a4a_client_checkout_submit_payment_info_already_submitted_error'
					)
				);
				page.redirect( A4A_CLIENT_SUBSCRIPTIONS_LINK );
				dispatch(
					successNotice( translate( 'Payment information already submitted.' ), {
						displayOnNextPage: true,
					} )
				);
				return;
			}
			dispatch( recordTracksEvent( 'calypso_a4a_client_checkout_submit_payment_info_error' ) );
			dispatch(
				errorNotice( translate( 'Failed to submit payment information. Please try again.' ) )
			);
		}
	}, [ dispatch, error?.code, status, translate ] );

	return (
		<>
			{ paymentMethodRequired ? (
				<div className="checkout__summary-client-payment-notice">
					{ translate( 'Before making a payment, add your payment method.' ) }
				</div>
			) : (
				<div className="checkout__summary-notice">
					{ translate(
						'By submitting your payment information you agree to the {{br/}} {{a}}Terms and Conditions{{/a}}',
						{
							components: {
								a: (
									<a
										href={ termsLink }
										target="_blank"
										rel="noopener noreferrer"
										onClick={ handleTermsClick }
									/>
								),
								br: <br />,
							},
						}
					) }
					<div>
						{ translate( `Note: You won't pay for the first 30 days.` ) }
						<br />
						{ translate( `After that, we'll charge your card every 30 days` ) }
					</div>
				</div>
			) }

			<div className="checkout__aside-actions">
				<Button
					primary={ ! paymentMethodRequired }
					onClick={ handleSubmitPaymentInfo }
					disabled={ isPending || disableButton }
					busy={ isPending }
				>
					{ paymentMethodRequired
						? translate( 'Add my payment method' )
						: translate( 'Submit my payment information' ) }
				</Button>
			</div>
			<div className="checkout__aside-footer">
				<div className="checkout__aside-powered-by">
					<div>{ translate( 'Powered by' ) }</div>
					<img src={ A4AFullLogo } alt="Automattic for Agencies" />
				</div>
			</div>
		</>
	);
}
