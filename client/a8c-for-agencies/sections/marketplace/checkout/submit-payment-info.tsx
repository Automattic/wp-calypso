import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
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
import NoticeSummary from './notice-summary';

export default function SubmitPaymentInfo( { disableButton }: { disableButton?: boolean } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ refetchInterval, setRefetchInterval ] = useState< number | undefined >( undefined );

	const { paymentMethodRequired } = usePaymentMethod( refetchInterval );

	const { mutate, isPending, status, error } = useSubmitPaymentInfoMutation();
	const { agencyId, referralId, secret, paymentMethodAdded } = getClientReferralQueryArgs();

	// Set refetch interval when payment method is added and remove the query arg
	useEffect( () => {
		if ( paymentMethodAdded ) {
			setRefetchInterval( 2000 );
			page.redirect(
				removeQueryArgs( window.location.pathname + window.location.search, 'payment_method_added' )
			);
		}
		return () => {
			clearInterval( refetchInterval );
		};
	}, [ paymentMethodAdded, refetchInterval ] );

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
				successNotice(
					translate( 'Thank you for your purchase! Your agency can now set up your product.' ),
					{
						displayOnNextPage: true,
					}
				)
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
			<NoticeSummary
				type={ paymentMethodRequired ? 'request-payment-method' : 'client-purchase' }
			/>

			<div className="checkout__aside-actions">
				<Button
					onClick={ handleSubmitPaymentInfo }
					disabled={ isPending || disableButton }
					busy={ isPending }
					primary
				>
					{ paymentMethodRequired ? translate( 'Add payment method' ) : translate( 'Purchase' ) }
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
