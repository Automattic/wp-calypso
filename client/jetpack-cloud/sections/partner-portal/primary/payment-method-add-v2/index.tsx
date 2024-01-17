import { Card } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutStepper from 'calypso/jetpack-cloud/components/layout/stepper';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import PaymentMethodForm from '../../payment-method-form';
import PaymentMethodStripeInfo from '../../payment-method-stripe-info';
import PartnerPortalSidebarNavigation from '../../sidebar-navigation';
import { usePaymentMethodStepper } from './hooks/use-payment-method-stepper';

import './style.scss';

export default function PaymentMethodAddV2( { isModal = false } ) {
	const translate = useTranslate();

	const title = translate( 'Add new card' );
	const subtitle = translate( 'You will only be charged for paid licenses you issue.' );

	const stepper = usePaymentMethodStepper();

	const layoutBodyContent = (
		<div
			className={ classNames( 'payment-method-add__content', {
				'payment-method-add__content--modal': isModal,
			} ) }
		>
			<Card className="payment-method-add__card payment-form">
				<PaymentMethodForm />
			</Card>

			<Card className="payment-method-add__card aside">
				<PaymentMethodStripeInfo />
			</Card>
		</div>
	);

	if ( isModal ) {
		return layoutBodyContent;
	}

	return (
		<Layout
			className="payment-method-add"
			title={ title }
			sidebarNavigation={ <PartnerPortalSidebarNavigation /> }
			wide
		>
			<LayoutTop>
				{ !! stepper && <LayoutStepper steps={ stepper.steps } current={ stepper.current } /> }

				<LayoutHeader>
					{ ! stepper && (
						<Breadcrumb
							items={ [
								{ label: translate( 'Payment Methods' ), href: '/partner-portal/payment-methods' },
								{ label: translate( 'Add new card' ) },
							] }
						/>
					) }
					<Title>{ title } </Title>
					<Subtitle>{ subtitle }</Subtitle>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ layoutBodyContent }</LayoutBody>
		</Layout>
	);
}
