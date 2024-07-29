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
	products?: React.ReactElement | React.ReactElement[];
	footerDetails?: ThankYouFooterDetailProps[];
	upsellProps?: ThankYouUpsellProps;
	isGravatarDomain?: boolean;
}

export default function ThankYouV2( props: ThankYouV2Props ) {
	const { title, subtitle, headerButtons, products, footerDetails, upsellProps, isGravatarDomain } =
		props;

	return (
		<div className="thank-you">
			<ConfettiAnimation delay={ 1000 } />

			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ headerButtons } />

			{ products && <div className="thank-you__products">{ products }</div> }

			{ footerDetails && ! isGravatarDomain && <ThankYouFooter details={ footerDetails } /> }

			{ upsellProps && ! isGravatarDomain && <ThankYouUpsell { ...upsellProps } /> }
		</div>
	);
}
