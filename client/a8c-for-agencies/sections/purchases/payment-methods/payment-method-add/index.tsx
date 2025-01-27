import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import LayoutStepper from 'calypso/a8c-for-agencies/components/layout/stepper';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_PAYMENT_METHODS_LINK,
	A4A_CLIENT_PAYMENT_METHODS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PaymentMethodStripeInfo from 'calypso/jetpack-cloud/sections/partner-portal/payment-method-stripe-info';
import { usePaymentMethodStepper } from 'calypso/jetpack-cloud/sections/partner-portal/primary/payment-method-add-v2/hooks/use-payment-method-stepper';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import { isClientView } from '../lib/is-client-view';
import PaymentMethodForm from './payment-method-form';

import './style.scss';

type Props = {
	withAssignLicense?: boolean;
	isClientCheckout?: boolean;
};

export default function PaymentMethodAdd( { withAssignLicense, isClientCheckout }: Props ) {
	const translate = useTranslate();
	const isClientUI = isClientView();

	const title = isClientCheckout
		? translate( 'Add your payment method' )
		: translate( 'Add new card' );

	const stepper = usePaymentMethodStepper( { withAssignLicense } );

	const paymentMethodsLink = isClientUI
		? A4A_CLIENT_PAYMENT_METHODS_LINK
		: A4A_PAYMENT_METHODS_LINK;

	return (
		<Layout
			className={ clsx( 'payment-method-add', {
				'is-client-checkout': isClientCheckout,
			} ) }
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			{ !! stepper && <LayoutStepper steps={ stepper.steps } current={ stepper.current } /> }

			<LayoutTop>
				<A4AAgencyApprovalNotice />
				<LayoutHeader>
					{ ! stepper && ! isClientCheckout && (
						<Breadcrumb
							items={ [
								{ label: translate( 'Payment Methods' ), href: paymentMethodsLink },
								{ label: translate( 'Add new card' ) },
							] }
						/>
					) }

					<Title>{ title } </Title>
					{ ! isClientCheckout && (
						<Subtitle>
							{ translate( 'You will only be charged for paid licenses you issue.' ) }
						</Subtitle>
					) }
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="payment-method-add__content">
					<Card className="payment-method-add__card payment-form">
						<PaymentMethodForm />
					</Card>

					<Card className="payment-method-add__card aside">
						<PaymentMethodStripeInfo />
					</Card>
				</div>
			</LayoutBody>
		</Layout>
	);
}
