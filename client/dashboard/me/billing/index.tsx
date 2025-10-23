import { __experimentalVStack as VStack, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, payment, receipt, institution, currencyDollar } from '@wordpress/icons';
import {
	purchasesRoute,
	billingHistoryRoute,
	paymentMethodsRoute,
	monetizeSubscriptionsRoute,
	taxDetailsRoute,
} from '../../app/router/me';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { getMonetizeSubscriptionsPageTitle } from '../billing-monetize-subscriptions/urls';

function Billing() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Billing' ) } /> }>
			<VStack spacing={ 4 }>
				<RouterLinkSummaryButton
					title={ __( 'Active upgrades' ) }
					description={ __(
						'View your current plan and usage as well as other active purchases.'
					) }
					decoration={ <Icon icon={ receipt } /> }
					to={ purchasesRoute.to }
				/>
				<RouterLinkSummaryButton
					title={ __( 'Billing history' ) }
					description={ __( 'View email receipts for past purchases.' ) }
					decoration={ <Icon icon={ backup } /> }
					to={ billingHistoryRoute.to }
				/>
				<RouterLinkSummaryButton
					title={ getMonetizeSubscriptionsPageTitle() }
					description={ __( 'Manage Monetize subscriptions.' ) }
					decoration={ <Icon icon={ currencyDollar } /> }
					to={ monetizeSubscriptionsRoute.to }
				/>
				<RouterLinkSummaryButton
					title={ __( 'Payment methods' ) }
					description={ __( 'Manage credit cards saved to your account.' ) }
					decoration={ <Icon icon={ payment } /> }
					to={ paymentMethodsRoute.to }
				/>
				<RouterLinkSummaryButton
					title={ __( 'Tax details' ) }
					description={ __( 'Configure tax details (VAT/GST/CT) to be included on all receipts.' ) }
					decoration={ <Icon icon={ institution } /> }
					to={ taxDetailsRoute.to }
				/>
			</VStack>
		</PageLayout>
	);
}

export default Billing;
