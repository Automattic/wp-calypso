import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getJetpackSaleCoupon } from 'calypso/state/marketing/selectors';

import './style.scss';

const getTimeLeftFromSecondsLeft = ( timeDiff: number ) => {
	return {
		days: Math.floor( timeDiff / ( 60 * 60 * 24 ) ),
		hours: Math.floor( ( timeDiff / ( 60 * 60 ) ) % 24 ),
		minutes: Math.floor( ( timeDiff / 60 ) % 60 ),
		seconds: Math.floor( timeDiff % 60 ),
	};
};

const SaleBanner: React.FC = () => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const [ isClosed, setIsClosed ] = useState( false );
	const jetpackSaleCoupon = useSelector( getJetpackSaleCoupon );
	const now = moment.utc().unix();
	const expiryDate = moment.utc( jetpackSaleCoupon?.expiry_date ).unix();
	const isBeforeExpiry = jetpackSaleCoupon && now <= expiryDate;
	const [ timeLeft, setTimeLeft ] = useState( getTimeLeftFromSecondsLeft( expiryDate - now ) );
	const { days, hours, minutes, seconds } = timeLeft;

	useEffect( () => {
		const intervalId = setInterval(
			() => setTimeLeft( getTimeLeftFromSecondsLeft( expiryDate - now ) ),
			1000
		);

		return () => clearInterval( intervalId );
	}, [ timeLeft, expiryDate, now, setTimeLeft ] );

	return (
		<>
			{ ! isClosed && isBeforeExpiry && (
				<div className="sale-banner" role="banner" aria-label={ translate( 'Discount Banner' ) }>
					<div className="sale-banner__content">
						<div>
							<b>{ translate( 'End of Summer Sale!' ) }</b>
							&nbsp;
							{ translate( 'Get %(discount)d%% off your first year of Jetpack', {
								args: { discount: jetpackSaleCoupon.discount },
							} ) }
						</div>
						<span className="sale-banner__countdown-timer">
							{ translate( 'Sale ends in: %(days)sd %(hours)sh %(minutes)sm %(seconds)ss', {
								args: { days, hours, minutes, seconds },
								comment: 'The end string will look like "Sale ends in: 13d 6h 2m 20s"',
							} ) }
						</span>
					</div>
					<button className="sale-banner__close-button" onClick={ () => setIsClosed( true ) }>
						<Gridicon icon="cross-small" size={ 24 } />
					</button>
				</div>
			) }
		</>
	);
};

export default SaleBanner;
