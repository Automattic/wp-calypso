import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function WooPaymentsCustomDescription() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onLearnMoreClick = useCallback( () => {
		dispatch(
			recordTracksEvent(
				'calypso_marketplace_products_overview_woopayments_learn_more_revenue_share_click'
			)
		);
	}, [ dispatch ] );

	const onViewFullTermsClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_marketplace_products_overview_woopayments_view_full_terms_click' )
		);
	}, [ dispatch ] );

	return (
		<div className="woopayments-custom-description">
			<div className="woopayments-custom-description__required-woocommerce-notice">
				<Icon icon={ info } />

				<span>{ translate( 'This extension requires WooCommerce' ) }</span>
			</div>

			<div className="woopayments-custom-description__section">
				<h3 className="jetpack-product-info__section-title">
					{ translate( 'Revenue Share Terms' ) }
				</h3>
				<p className="jetpack-product-info__description">
					{ translate(
						'To qualify for revenue sharing, you must install and connect the Automattic for Agencies plugin and WooPayments extension on your client sites. We recommend using this marketplace to install WooPayments after adding the Automattic for Agencies plugin for easier license and client site management. {{a}}Learn more{{/a}}',
						{
							components: {
								a: (
									<a
										href="https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/"
										target="_blank"
										rel="noopener noreferrer"
										onClick={ onLearnMoreClick }
									></a>
								),
							},
						}
					) }
				</p>
				<p className="jetpack-product-info__description">
					{ translate(
						'You will receive a revenue share of 5 basis points on new Total Payments Volume (“TPV”) on client sites through June 30, 2025. {{a}}View full terms{{/a}}',
						{
							components: {
								a: (
									<a
										href="https://automattic.com/for-agencies/program-incentives/"
										target="_blank"
										rel="noopener noreferrer"
										onClick={ onViewFullTermsClick }
									></a>
								),
							},
						}
					) }
				</p>
			</div>

			<div className="woopayments-custom-description__section">
				<h3 className="jetpack-product-info__section-title">
					{ translate( 'About WooPayments' ) }
				</h3>
				<p className="jetpack-product-info__description">
					{ translate(
						"With WooPayments, you can collect payments, track cash flow, handle disputes, and manage recurring revenue directly from your store's dashboard — without needing to log into a third-party platform."
					) }
				</p>

				<p className="jetpack-product-info__description">
					{ translate(
						'WooPayments simplifies the payment process for you and your customers, leaving you with more time to focus on growing your business. This fully integrated solution is the only payment method designed exclusively for WooCommerce, by Woo.'
					) }
				</p>
			</div>
		</div>
	);
}
