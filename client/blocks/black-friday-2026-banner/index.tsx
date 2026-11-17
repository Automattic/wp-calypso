import { Button } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	BLACK_FRIDAY_2026_DISCOUNT_PERCENT,
	BLACK_FRIDAY_2026_END,
	isBlackFriday2026Active,
} from 'calypso/lib/promotions/black-friday-2026';

import './style.scss';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
// setTimeout fires immediately for longer delays.
const MAX_TIMEOUT = 2 ** 31 - 1;

function getTimeLeft( now: number ) {
	const remaining = Math.max( 0, BLACK_FRIDAY_2026_END - now );
	return {
		days: Math.floor( remaining / DAY ),
		hours: Math.floor( ( remaining % DAY ) / HOUR ),
		minutes: Math.floor( ( remaining % HOUR ) / MINUTE ),
		seconds: Math.floor( ( remaining % MINUTE ) / SECOND ),
	};
}

const pad = ( value: number ) => String( value ).padStart( 2, '0' );

function Countdown() {
	const translate = useTranslate();
	const [ now, setNow ] = useState( () => Date.now() );

	useEffect( () => {
		const interval = setInterval( () => setNow( Date.now() ), SECOND );
		return () => clearInterval( interval );
	}, [] );

	const { days, hours, minutes, seconds } = getTimeLeft( now );

	return (
		<strong className="black-friday-2026-banner__countdown">
			{ days > 0 && (
				<>
					<span>
						{ translate( '%(days)d day', '%(days)d days', { count: days, args: { days } } ) }
					</span>{ ' ' }
				</>
			) }
			<span>{ `${ pad( hours ) }:${ pad( minutes ) }:${ pad( seconds ) }` }</span>
		</strong>
	);
}

export default function BlackFriday2026Banner() {
	const translate = useTranslate();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const [ , setHasSaleEnded ] = useState( false );
	const isVisible = ! isDismissed && isBlackFriday2026Active();
	const [ bar, setBar ] = useState< HTMLDivElement | null >( null );
	const [ barHeight, setBarHeight ] = useState( 0 );

	// Re-render once the sale is over, so an open page drops the bar.
	useEffect( () => {
		const timeLeft = BLACK_FRIDAY_2026_END - Date.now();
		if ( timeLeft <= 0 || timeLeft > MAX_TIMEOUT ) {
			return;
		}
		const timeout = setTimeout( () => setHasSaleEnded( true ), timeLeft + SECOND );
		return () => clearTimeout( timeout );
	}, [] );

	// The spacer reserves the fixed bar's height, which grows when the bar wraps on small screens.
	useEffect( () => {
		if ( ! bar || typeof ResizeObserver === 'undefined' ) {
			return;
		}
		const observer = new ResizeObserver( () => setBarHeight( bar.offsetHeight ) );
		observer.observe( bar );
		return () => observer.disconnect();
	}, [ bar ] );

	useEffect( () => {
		if ( isVisible ) {
			recordTracksEvent( 'calypso_bf2026_plans_banner_view' );
		}
	}, [ isVisible ] );

	if ( ! isVisible ) {
		return null;
	}

	const percent = BLACK_FRIDAY_2026_DISCOUNT_PERCENT;

	const onDismiss = () => {
		recordTracksEvent( 'calypso_bf2026_plans_banner_dismiss' );
		setIsDismissed( true );
	};

	return (
		<div className="black-friday-2026-banner-spacer" style={ { blockSize: barHeight } }>
			<div
				ref={ setBar }
				className="black-friday-2026-banner"
				role="region"
				aria-label={ translate( 'Sale' ) }
			>
				<div className="black-friday-2026-banner__tiles" aria-hidden="true">
					<span className="black-friday-2026-banner__tile black-friday-2026-banner__tile-globe" />
					<span className="black-friday-2026-banner__tile black-friday-2026-banner__tile-crop" />
					<span className="black-friday-2026-banner__tile black-friday-2026-banner__tile-quarter" />
				</div>
				<p className="black-friday-2026-banner__text">
					{ translate( 'Until December 1: %(percent)d%% off annual and multi-year plans.', {
						args: { percent },
					} ) }{ ' ' }
					<Countdown />
				</p>
				<Button
					__next40pxDefaultSize
					className="black-friday-2026-banner__close"
					variant="tertiary"
					onClick={ onDismiss }
					label={ translate( 'Dismiss' ) }
					icon={ <Icon icon={ close } size={ 24 } /> }
				/>
			</div>
		</div>
	);
}
