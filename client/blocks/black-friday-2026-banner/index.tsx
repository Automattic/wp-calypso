import { Button } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	BLACK_FRIDAY_2026_DISCOUNT_PERCENT,
	isBlackFriday2026Active,
} from 'calypso/lib/promotions/black-friday-2026';

import './style.scss';

export const BLACK_FRIDAY_2026_BANNER_DISMISSED_KEY = 'bf2026-plans-banner-dismissed';
const PLANS_GRID_SELECTOR = '.plans-features-main__group';

function readIsDismissed(): boolean {
	try {
		return window.localStorage.getItem( BLACK_FRIDAY_2026_BANNER_DISMISSED_KEY ) === '1';
	} catch {
		return false;
	}
}

export default function BlackFriday2026Banner() {
	const translate = useTranslate();
	// Hidden until the effect reads storage, so SSR and the first render never touch it.
	const [ isDismissed, setIsDismissed ] = useState( true );
	const isVisible = ! isDismissed && isBlackFriday2026Active();
	const [ bar, setBar ] = useState< HTMLDivElement | null >( null );
	const [ barHeight, setBarHeight ] = useState( 0 );

	useEffect( () => {
		setIsDismissed( readIsDismissed() );
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

	const onCtaClick = () => {
		recordTracksEvent( 'calypso_bf2026_plans_banner_click' );
		const prefersReducedMotion = window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches;
		document.querySelector( PLANS_GRID_SELECTOR )?.scrollIntoView( {
			behavior: prefersReducedMotion ? 'auto' : 'smooth',
			block: 'start',
		} );
	};

	const onDismiss = () => {
		recordTracksEvent( 'calypso_bf2026_plans_banner_dismiss' );
		try {
			window.localStorage.setItem( BLACK_FRIDAY_2026_BANNER_DISMISSED_KEY, '1' );
		} catch {
			// Storage can be blocked; the banner still hides for this page view.
		}
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
				<div className="black-friday-2026-banner__content">
					<p className="black-friday-2026-banner__title">
						{ translate( 'Black Friday: %(percent)d%% off annual plans', { args: { percent } } ) }
					</p>
					<Button
						__next40pxDefaultSize
						className="black-friday-2026-banner__cta"
						variant="primary"
						onClick={ onCtaClick }
					>
						{ translate( 'Get %(percent)d%% off', { args: { percent } } ) }
					</Button>
				</div>
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
