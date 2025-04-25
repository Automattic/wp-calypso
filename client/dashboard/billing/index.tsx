import { __experimentalVStack as VStack, Icon, Card } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, payment, receipt, institution } from '@wordpress/icons';
import {
	activeSubscriptionsRoute,
	billingHistoryRoute,
	paymentMethodsRoute,
	taxDetailsRoute,
} from '../app/router';
import PageLayout from '../page-layout';
import RouterLinkSummaryButton from '../router-link-summary-button';
import SummaryButton from '../summary-button';

function Billing() {
	return (
		<PageLayout title={ __( 'Billing' ) } size="small">
			<VStack spacing={ 4 }>
				<RouterLinkSummaryButton
					title={ __( 'Active subscriptions' ) }
					description={ __( 'View your current plan and usage.' ) }
					decoration={ <Icon icon={ receipt } /> }
					to={ activeSubscriptionsRoute.to }
				/>
				<SummaryButton
					title={ __( 'Billing history' ) }
					description={ __( 'View email receipts for past purchases.' ) }
					decoration={ <Icon icon={ backup } /> }
					strapline={ __( 'Needs attention' ) }
					to={ billingHistoryRoute.to }
					fields={ [
						{ text: 'Needs attention', intent: 'warning' },
						{ text: 'Auto-renew off', intent: 'error' },
					] }
				/>
				<SummaryButton
					title={ __( 'Disabled' ) }
					description={ __( 'View email receipts for past purchases.' ) }
					decoration={ <Icon icon={ backup } /> }
					strapline={ __( 'Needs attention' ) }
					to={ billingHistoryRoute.to }
					fields={ [
						{ text: 'Needs attention', intent: 'warning' },
						{ text: 'Auto-renew off', intent: 'error' },
					] }
					disabled
				/>
				<SummaryButton
					title={ __( 'Billing history' ) }
					description={ __( 'View email receipts for past purchases.' ) }
					decoration={ <Icon icon={ backup } /> }
					strapline={ __( 'Needs attention' ) }
					fields={ [
						{ text: 'Needs attention', intent: 'warning' },
						{ text: 'Auto-renew off', intent: 'error' },
					] }
				/>
				<SummaryButton
					title={ __( 'Billing history' ) }
					density="medium"
					description={ __( 'View email receipts for past purchases.' ) }
					decoration={ <Icon icon={ backup } /> }
					strapline={ __( 'Needs attention' ) }
					to={ billingHistoryRoute.to }
					fields={ [
						{ text: 'Needs attention', intent: 'warning' },
						{ text: 'Auto-renew off', intent: 'error' },
					] }
				/>
				<Card>
					<h2>Rigas</h2>
				</Card>
				<RouterLinkSummaryButton
					title={ __( 'Billing history' ) }
					description={ __( 'View email receipts for past purchases.' ) }
					decoration={ <Icon icon={ backup } /> }
					to={ billingHistoryRoute.to }
					fields={ [
						{ text: 'Needs attention', intent: 'warning' },
						{ text: 'Auto-renew off', intent: 'error' },
					] }
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
