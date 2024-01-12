import { ConfettiAnimation } from '@automattic/components';
import { TranslateResult } from 'i18n-calypso';
import ThankYouFooter, { ThankYouFooterDetailProps } from './footer';
import ThankYouHeader from './header';
import ThankYouUpsell, { ThankYouUpsellProps } from './upsell';

import './style.scss';

interface ThankYouV2Props {
	title: TranslateResult;
	subtitle: TranslateResult;
	headerButtons?: React.ReactNode;
	products?: React.ReactElement[];
	footerDetails?: ThankYouFooterDetailProps[];
	upsellProps?: ThankYouUpsellProps;
}

export default function ThankYouV2( props: ThankYouV2Props ) {
	const { title, subtitle, headerButtons, products, footerDetails, upsellProps } = props;

	return (
		<div className="thank-you">
			<ConfettiAnimation delay={ 1000 } />

			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ headerButtons } />

			{ products && <div className="thank-you__products">{ products }</div> }

			{ footerDetails && <ThankYouFooter details={ footerDetails } /> }

			{ upsellProps && <ThankYouUpsell { ...upsellProps } /> }
		</div>
	);
}
