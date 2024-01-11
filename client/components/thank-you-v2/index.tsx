import { TranslateResult } from 'i18n-calypso';
import ThankYouFooter, { ThankYouFooterDetailProps } from './footer';
import ThankYouHeader from './header';
import ThankYouUpsell, { ThankYouUpsellProps } from './upsell';

import './style.scss';

interface ThankYouV2Props {
	title: TranslateResult;
	subtitle: TranslateResult;
	headerButtons?: React.ReactNode;
	products?: React.ReactNode;
	footerDetails?: ThankYouFooterDetailProps[];
	upsellProps?: ThankYouUpsellProps;
}

const ThankYouV2: React.FC< ThankYouV2Props > = ( props: ThankYouV2Props ) => {
	const { title, subtitle, headerButtons, products, footerDetails, upsellProps } = props;

	return (
		<div className="thank-you">
			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ headerButtons } />

			{ products && <div className="thank-you__products">{ products }</div> }

			{ footerDetails && <ThankYouFooter details={ footerDetails } /> }

			{ upsellProps && <ThankYouUpsell { ...upsellProps } /> }
		</div>
	);
};

export default ThankYouV2;
