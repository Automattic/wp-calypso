import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	type: 'client-purchase' | 'agency-purchase' | 'request-client-payment' | 'request-payment-method';
};

export default function NoticeSummary( { type }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	const title = useMemo( () => {
		switch ( type ) {
			case 'client-purchase':
			case 'agency-purchase':
				return translate( 'When you purchase:' );
			case 'request-client-payment':
				return translate( 'When you share this payment request:' );
			default:
				return null;
		}
	}, [ translate, type ] );

	const items = useMemo( () => {
		switch ( type ) {
			case 'client-purchase':
			case 'agency-purchase':
				return [
					translate(
						'You agree to our {{a}}Terms of Service{{/a}}, and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time.',
						{
							components: {
								a: (
									<Button
										variant="link"
										href={ localizeUrl( 'https://wordpress.com/tos' ) }
										onClick={ () => {
											dispatch(
												recordTracksEvent( 'calypso_a4a_client_checkout_client_terms_click' )
											);
										} }
										target="_blank"
										rel="noreferrer noopener"
									/>
								),
							},
						}
					),
					translate(
						'You understand {{subscriptionInfoLink}}how your subscription works{{/subscriptionInfoLink}} and {{cancellationInfoLink}}how to cancel{{/cancellationInfoLink}}.',
						{
							components: {
								subscriptionInfoLink: (
									<Button
										variant="link"
										onClick={ () => {
											showSupportGuide(
												type === 'client-purchase'
													? 'https://agencieshelp.automattic.com/knowledge-base/client-billing/#how-subscriptions-work'
													: 'https://agencieshelp.automattic.com/knowledge-base/billing-and-payments'
											);
											dispatch(
												recordTracksEvent(
													'calypso_a4a_client_checkout_subscription_info_link_click'
												)
											);
										} }
									/>
								),
								cancellationInfoLink: (
									<Button
										variant="link"
										onClick={ () => {
											showSupportGuide(
												type === 'client-purchase'
													? 'https://agencieshelp.automattic.com/knowledge-base/client-billing/#how-to-cancel'
													: 'https://agencieshelp.automattic.com/knowledge-base/purchases/#canceling-purchases'
											);
											dispatch(
												recordTracksEvent(
													'calypso_a4a_client_checkout_cancellation_info_link_click'
												)
											);
										} }
									/>
								),
							},
						}
					),
					translate(
						"{{strong}}You won't be billed today.{{/strong}} Invoices are sent on the first of every month and are based on the number of days your product licenses were active in the previous month. Your first invoice will be prorated.",
						{
							components: {
								strong: <strong />,
							},
						}
					),
				];
			case 'request-client-payment':
				return [
					translate(
						"Your client will receive instructions to create a WordPress.com account and complete their purchase. Once their payment is successful, they'll be enrolled in an automatically renewing subscription (monthly or annual, based on checkout). They can cancel anytime."
					),
					translate(
						"After their purchase, you'll be able to manage the products on your client's behalf."
					),
				];

			case 'request-payment-method':
				return [
					translate(
						'Add a payment method to proceed with your purchase. You’ll have the opportunity to confirm your purchase after the payment method is added.'
					),
				];
			default:
				return [];
		}
	}, [ dispatch, showSupportGuide, translate, type ] );

	return (
		<div className="checkout__summary-notice">
			{ title && <h3>{ title }</h3> }
			{ items.map( ( item, index ) => (
				<div key={ `notice-item-${ index }` } className="checkout__summary-notice-item">
					{ item }
				</div>
			) ) }
		</div>
	);
}
