import {
	Button,
	ExternalLink,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { useHelpCenter } from '../../../app/help-center';
import { Notice } from '../../../components/notice';

const REVENUE_SHARE_GUIDE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';
const PROGRAM_INCENTIVES_URL = 'https://automattic.com/for-agencies/program-incentives/';

export default function WooPaymentsDetails() {
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const openRevenueShareGuide = () => {
		recordTracksEvent(
			'calypso_marketplace_products_overview_woopayments_learn_more_revenue_share_click'
		);
		setShowHelpCenter( true );
		setNavigateToRoute( '/post?link=' + encodeURIComponent( REVENUE_SHARE_GUIDE_URL ) );
	};

	return (
		<>
			<Notice>{ __( 'This extension requires WooCommerce' ) }</Notice>
			<VStack spacing={ 2 }>
				<Text weight={ 500 }>{ __( 'Revenue Share terms' ) }</Text>
				<Text variant="muted">
					{ createInterpolateElement(
						__(
							'To qualify for revenue sharing, you must install and connect the Automattic for Agencies plugin and WooPayments extension on your client sites. We recommend using this marketplace to install WooPayments after adding the Automattic for Agencies plugin for easier license and client site management. <a>Learn more</a>'
						),
						{ a: <Button variant="link" onClick={ openRevenueShareGuide } /> }
					) }
				</Text>
				<Text variant="muted">
					{ createInterpolateElement(
						__(
							'You will receive a revenue share of 5 basis points on new Total Payments Volume (“TPV”) on client sites. <a>View full terms</a>'
						),
						{
							a: (
								<ExternalLink
									href={ PROGRAM_INCENTIVES_URL }
									onClick={ () =>
										recordTracksEvent(
											'calypso_marketplace_products_overview_woopayments_view_full_terms_click'
										)
									}
								>
									{ null }
								</ExternalLink>
							),
						}
					) }
				</Text>
			</VStack>
			<VStack spacing={ 2 }>
				<Text weight={ 500 }>{ __( 'About WooPayments' ) }</Text>
				<Text variant="muted">
					{ __(
						"With WooPayments, you can collect payments, track cash flow, handle disputes, and manage recurring revenue directly from your store's dashboard — without needing to log into a third-party platform."
					) }
				</Text>
				<Text variant="muted">
					{ __(
						'WooPayments simplifies the payment process for you and your customers, leaving you with more time to focus on growing your business. This fully integrated solution is the only payment method designed exclusively for WooCommerce, by Woo.'
					) }
				</Text>
			</VStack>
		</>
	);
}
