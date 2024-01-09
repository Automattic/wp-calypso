import { ConfettiAnimation } from '@automattic/components';
import Main from 'calypso/components/main';
import PurchaseDetail from 'calypso/components/purchase-detail';
import ThankYouHeader from './header';
import ThankYouUpsell, { ThankYouUpsellProps } from './upsell';

import './style.scss';

interface ThankYouV2Props {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	headerButtons?: React.ReactNode;
	products?: React.ReactNode;
	purchaseDetailsProps?: PurchaseDetail.propTypes[];
	upsellProps?: ThankYouUpsellProps;
}

const ThankYouV2: React.FC< ThankYouV2Props > = ( props: ThankYouV2Props ) => {
	const { title, subtitle, headerButtons, products, purchaseDetailsProps, upsellProps } = props;

	return (
		<Main className="is-redesign-v2 checkout-thank-you">
			<ConfettiAnimation delay={ 1000 } />

			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ headerButtons } />

			<div className="checkout-thank-you__products">{ products }</div>

			{ purchaseDetailsProps && (
				<div className="checkout-thank-you__purchase-details-list">
					{ purchaseDetailsProps.map( ( purchaseDetailProps, index ) => (
						<PurchaseDetail { ...purchaseDetailProps } key={ 'details' + index } />
					) ) }
				</div>
			) }

			{ upsellProps && <ThankYouUpsell { ...upsellProps } /> }
		</Main>
	);
};

export default ThankYouV2;
