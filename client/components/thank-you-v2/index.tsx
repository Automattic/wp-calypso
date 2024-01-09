import { ConfettiAnimation } from '@automattic/components';
import ThankYouFooter, { ThankYouDetailProps } from './footer';
import ThankYouHeader from './header';
import ThankYouUpsell, { ThankYouUpsellProps } from './upsell';

import './style.scss';

interface ThankYouV2Props {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	headerButtons?: React.ReactNode;
	products?: React.ReactNode;
	footerDetails?: ThankYouDetailProps[];
	upsellProps?: ThankYouUpsellProps;
}

const ThankYouV2: React.FC< ThankYouV2Props > = ( props: ThankYouV2Props ) => {
	const { title, subtitle, headerButtons, products, footerDetails, upsellProps } = props;

	return (
		<div className="thank-you__container">
			<ConfettiAnimation delay={ 1000 } />

			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ headerButtons } />

			<div className="thank-you__products">{ products }</div>

			{ footerDetails && <ThankYouFooter footerDetails={ footerDetails } /> }

			{ upsellProps && <ThankYouUpsell { ...upsellProps } /> }
		</div>
	);
};

export default ThankYouV2;
