import { ConfettiAnimation } from '@automattic/components';
import { TranslateResult } from 'i18n-calypso';
import { useEffect, useState } from 'react';
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
	showSuccessAnimation?: boolean;
}

export default function ThankYouV2( props: ThankYouV2Props ) {
	const {
		title,
		subtitle,
		headerButtons,
		products,
		footerDetails,
		upsellProps,
		isGravatarDomain,
		showSuccessAnimation = true,
	} = props;

	const [ shouldShowAnimation, setShouldShowAnimation ] = useState( false );

	useEffect( () => {
		if ( showSuccessAnimation ) {
			setShouldShowAnimation( true );
		}
	}, [ showSuccessAnimation ] );

	return (
		<div className="thank-you">
			{ shouldShowAnimation && <ConfettiAnimation delay={ 1000 } /> }

			<ThankYouHeader title={ title } subtitle={ subtitle } buttons={ headerButtons } />

			{ products && <div className="thank-you__products">{ products }</div> }

			{ footerDetails && ! isGravatarDomain && <ThankYouFooter details={ footerDetails } /> }

			{ upsellProps && ! isGravatarDomain && <ThankYouUpsell { ...upsellProps } /> }
		</div>
	);
}
