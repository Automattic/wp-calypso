import Main from 'calypso/components/main';
import PurchaseDetail from 'calypso/components/purchase-detail';
import CheckoutMasterbar, { CheckoutMasterbarProps } from './sections/CheckoutMasterbar';
import ThankYouHeader from './sections/header/Default';
import ThankYouProduct, { ThankYouProductProps } from './sections/product/Default';
import DefaultUpsell, { DefaultUpsellProps } from './sections/upsell/Default';

import './style.scss';

interface ThankYouLayoutContainerProps {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	buttons?: React.ReactNode;
	productsProps: ThankYouProductProps[];
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
		productsProps,
		purchaseDetailsProps,
		upsellProps,
		masterbarProps,
	} = props;

	return (
		<Main className="is-redesign-v2 checkout-thank-you">
			<CheckoutMasterbar { ...masterbarProps } />

			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ buttons } />

			{ productsProps && (
				<div className="checkout-thank-you__products">
					{ productsProps.map( ( productProps ) => (
						<ThankYouProduct { ...productProps } />
					) ) }
				</div>
			) }

			{ purchaseDetailsProps && (
				<div className="checkout-thank-you__purchase-details-list">
					{ purchaseDetailsProps.map( ( purchaseDetailProps ) => (
						<PurchaseDetail { ...purchaseDetailProps } />
					) ) }
				</div>
			) }

			{ upsellProps && <DefaultUpsell { ...upsellProps } /> }
		</Main>
	);
};

export default ThankYouLayout;
