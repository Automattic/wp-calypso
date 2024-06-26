import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	type: 'client-purchase' | 'agency-purchase' | 'request-client-payment' | 'request-payment-method';
};

export default function NoticeSummary( { type }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = useMemo( () => {
		switch ( type ) {
			case 'client-purchase':
			case 'agency-purchase':
				return translate( 'When you purchase:' );
			case 'request-client-payment':
				return translate( 'When you send this payment request:' );
			default:
				return null;
		}
	}, [ translate, type ] );

	const handleClientTermsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_client_checkout_client_terms_click' ) );
	}, [ dispatch ] );

	const handleAgencyTermsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_client_checkout_agency_terms_click' ) );
	}, [ dispatch ] );

	const handleSubscriptionInfoLinkClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_client_checkout_subscription_info_link_click' ) );
	}, [ dispatch ] );

	const handleCancellationInfoLinkClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_client_checkout_cancellation_info_link_click' ) );
	}, [ dispatch ] );

	const items = useMemo( () => {
		switch ( type ) {
			case 'client-purchase':
			case 'agency-purchase':
				return [
					translate(
						'You agree to our {{a/}}, and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time.',
						{
							components: {
								a:
									type === 'client-purchase' ? (
										<a
											href={ localizeUrl( 'https://wordpress.com/tos' ) }
											onClick={ handleClientTermsClick }
											target="_blank"
											rel="noreferrer noopener"
										>
											{ translate( 'Terms of Service' ) }
										</a>
									) : (
										<a
											href={ localizeUrl(
												'https://automattic.com/for-agencies/platform-agreement/'
											) }
											onClick={ handleAgencyTermsClick }
											target="_blank"
											rel="noreferrer noopener"
										>
											{ translate( 'Platform agreement' ) }
										</a>
									),
							},
						}
					),
					translate(
						'You understand {{subscriptionInfoLink}}how your subscription works{{/subscriptionInfoLink}} and {{cancellationInfoLink}}how to cancel{{/cancellationInfoLink}}.',
						{
							components: {
								subscriptionInfoLink: (
									<a
										href={ localizeUrl(
											'https://agencieshelp.automattic.com/knowledge-base/client-billing/#how-subscriptions-work'
										) }
										onClick={ handleSubscriptionInfoLinkClick }
										target="_blank"
										rel="noreferrer noopener"
									/>
								),
								cancellationInfoLink: (
									<a
										href={ localizeUrl(
											'https://agencieshelp.automattic.com/knowledge-base/client-billing/#how-to-cancel'
										) }
										onClick={ handleCancellationInfoLinkClick }
										target="_blank"
										rel="noreferrer noopener"
									/>
								),
							},
						}
					),
					translate(
						'You will be billed on the first of every month. Your first bill will include a prorated amount for the current month, depending on which day you purchased these products. '
					),
				];
			case 'request-client-payment':
				return [
					translate(
						"Your client will be sent an invoice where they will be asked to create a WordPress.com account to pay for these products. Once paid, you'll be able to manage these products on behalf of the client."
					),
					translate( 'The client can cancel their products at any time.' ),
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
	}, [
		handleAgencyTermsClick,
		handleCancellationInfoLinkClick,
		handleClientTermsClick,
		handleSubscriptionInfoLinkClick,
		translate,
		type,
	] );

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
