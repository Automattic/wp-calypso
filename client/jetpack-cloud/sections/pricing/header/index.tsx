import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';

import './style.scss';

const useHasSaleBanner = () => {
	const moment = useLocalizedMoment();
	const coupon = useSelector( getJetpackSaleCoupon );

	const now = moment.utc().unix();
	const expiryDate = moment.utc( coupon?.expiry_date ).unix();
	const isBeforeExpiry = coupon && now <= expiryDate;

	return isBeforeExpiry;
};

const Header: React.FC< Props > = ( { title } ) => {
	const translate = useTranslate();
	const hasSaleBanner = useHasSaleBanner();

	return (
		<>
			<div className={ clsx( 'header', { 'has-sale-banner': hasSaleBanner } ) }>
				<FormattedHeader
					className="header__main-title"
					headerText={
						title ?? translate( 'Security, performance, and marketing tools made for WordPress' )
					}
					align="center"
				/>
			</div>
		</>
	);
};

type Props = {
	urlQueryArgs: { [ key: string ]: string };
	title?: string;
};

export default Header;
