import { Card, ConfettiAnimation } from '@automattic/components';
import CheckoutMasterbar, { CheckoutMasterbarProps } from 'calypso/components/checkout-masterbar';
import Main from 'calypso/components/main';
import PurchaseDetail from 'calypso/components/purchase-detail';
import ThankYouHeader from './header';
import ThankYouProduct, { ThankYouProductProps } from './product';
import DefaultUpsell, { DefaultUpsellProps } from './upsell';

import './style.scss';

interface ThankYouLayoutContainerProps {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	buttons?: React.ReactNode;
	products?: React.ReactNode;
	purchaseDetailsProps?: PurchaseDetail.propTypes[];
	upsellProps?: DefaultUpsellProps;
	masterbarProps?: CheckoutMasterbarProps;
}

const ThankYouLayout: React.FC< ThankYouLayoutContainerProps > = (
	props: ThankYouLayoutContainerProps
) => {
	const {
		title,
		subtitle,
		buttons,
		products,
		purchaseDetailsProps,
		upsellProps,
		masterbarProps,
	} = props;

	return (
		<Main className="is-redesign-v2 checkout-thank-you">
			<CheckoutMasterbar { ...masterbarProps } />

			<ConfettiAnimation delay={ 1000 } />

			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ buttons } />

			<div className="checkout-thank-you__products">
				{ products }
			</div>

			{ purchaseDetailsProps && (
				<div className="checkout-thank-you__purchase-details-list">
					{ purchaseDetailsProps.map( ( purchaseDetailProps, index ) => (
						<PurchaseDetail { ...purchaseDetailProps } key={ 'details' + index } />
					) ) }
				</div>
			) }

			{ upsellProps && <DefaultUpsell { ...upsellProps } /> }
		</Main>
	);
};

export default ThankYouLayout;
