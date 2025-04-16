import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, payment, receipt, institution } from '@wordpress/icons';
import {
	activeSubscriptionsRoute,
	billingHistoryRoute,
	paymentMethodsRoute,
	taxDetailsRoute,
} from '../app/router';
import PageLayout from '../page-layout';
import BillingCard from './billing-card';

function Billing() {
	return (
		<PageLayout title={ __( 'Billing' ) } size="small">
			<VStack spacing={ 4 }>
				<BillingCard
					title={ __( 'Active subscriptions' ) }
					description={ __( 'View, manage or cancel your plan and other subscriptions.' ) }
					icon={ receipt }
					to={ activeSubscriptionsRoute.to }
				/>
				<BillingCard
					title={ __( 'Billing history' ) }
					description={ __( 'View email receipts for past purchases.' ) }
					icon={ backup }
					to={ billingHistoryRoute.to }
				/>
				<BillingCard
					title={ __( 'Payment methods' ) }
					description={ __( 'Manage credit cards saved to your account.' ) }
					icon={ payment }
					to={ paymentMethodsRoute.to }
				/>
				<BillingCard
					title={ __( 'Tax details' ) }
					description={ __( 'Configure tax details (VAT/GST/CT) to be included on all receipts.' ) }
					icon={ institution }
					to={ taxDetailsRoute.to }
				/>
			</VStack>
		</PageLayout>
	);
}

export default Billing;
