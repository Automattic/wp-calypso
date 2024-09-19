import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import * as React from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { JetpackSaleCoupon } from 'calypso/state/marketing/selectors';

import './style.scss';

const getTimeLeftFromSecondsLeft = ( timeDiff: number ) => {
	return {
		days: Math.floor( timeDiff / ( 60 * 60 * 24 ) ),
		hours: Math.floor( ( timeDiff / ( 60 * 60 ) ) % 24 ),
		minutes: Math.floor( ( timeDiff / 60 ) % 60 ),
		seconds: Math.floor( timeDiff % 60 )
			.toString()
			.padStart( 2, '0' ),
	};
};

type Props = {
	coupon: JetpackSaleCoupon;
};

const SaleBanner: React.FC< Props > = ( { coupon } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const [ isClosed, setIsClosed ] = useState( false );
	const saleTitle = coupon.sale_title;
	const saleDescription = coupon.sale_description;
	const now = moment.utc().unix();
	const expiryDate = moment.utc( coupon?.expiry_date ).unix();
	const isBeforeExpiry = coupon && now <= expiryDate;
	const [ timeLeft, setTimeLeft ] = useState( getTimeLeftFromSecondsLeft( expiryDate - now ) );
	const { days, hours, minutes, seconds } = timeLeft;

	useEffect( () => {
		const intervalId = setInterval(
			() => setTimeLeft( getTimeLeftFromSecondsLeft( expiryDate - now ) ),
			1000
		);

		return () => clearInterval( intervalId );
	}, [ timeLeft, expiryDate, now, setTimeLeft ] );

	const closeBanner = () => {
		dispatch( recordTracksEvent( 'calypso_pricing_page_sale_banner_close_button_click' ) );
		setIsClosed( true );
	};

	return (
		<>
			{ ! isClosed && isBeforeExpiry && (
				<div
					className="sale-banner"
					role="banner"
					aria-label={ String( translate( 'Discount Banner' ) ) }
				>
					<div className="sale-banner__content">
						<div>
							<b>{ saleTitle }</b>
							&nbsp;
							{ saleDescription }
						</div>
						<span className="sale-banner__countdown-timer">
							{ translate( 'Sale ends in: %(days)dd %(hours)dh %(minutes)dm %(seconds)ss', {
								args: { days, hours, minutes, seconds },
								comment: 'The end string will look like "Sale ends in: 13d 6h 2m 20s"',
							} ) }
						</span>
					</div>
					<button className="sale-banner__close-button" onClick={ closeBanner }>
						<Gridicon icon="cross-small" size={ 24 } />
					</button>
				</div>
			) }
		</>
	);
};

export default SaleBanner;
