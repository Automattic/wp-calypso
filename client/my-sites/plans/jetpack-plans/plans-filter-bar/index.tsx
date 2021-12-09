import { TERM_MONTHLY, TERM_ANNUALLY } from '@automattic/calypso-products';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';
import * as React from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { INTRO_PRICING_DISCOUNT_PERCENTAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import useDetectWindowBoundary from '../use-detect-window-boundary';
import type { Duration, DurationChangeCallback } from '../types';

import './style.scss';

interface FilterBarProps {
	showDiscountMessage?: boolean;
	showDurations?: boolean;
	duration?: Duration;
	onDurationChange?: DurationChangeCallback;
}

type DiscountMessageProps = {
	toggleChecked?: boolean;
};

const DiscountMessage: React.FC< DiscountMessageProps > = ( { toggleChecked } ) => {
	const translate = useTranslate();
	const isMobile: boolean = useMobileBreakpoint();

	return toggleChecked ? (
		<div
			className={ classNames( 'plans-filter-bar__discount-message', {
				toggleChecked,
			} ) }
		>
			<div>
				{ String.fromCodePoint( 0x1f389 ) } { /* Celebration emoji 🎉 */ }
				<span className="plans-filter-bar__discount-message-text">
					{ isMobile
						? translate( 'Get %(discount)s%% off by billing yearly', {
								args: { discount: INTRO_PRICING_DISCOUNT_PERCENTAGE },
								comment: 'Discount is a percentage',
						  } )
						: translate( 'Get %(discount)s%% off*', {
								args: { discount: INTRO_PRICING_DISCOUNT_PERCENTAGE },
								comment: 'Discount is a percentage. * is a clause describing the price adjustment.',
						  } ) }
				</span>
			</div>
		</div>
	) : null;
};

const PlansFilterBar: React.FC< FilterBarProps > = ( {
	showDiscountMessage,
	duration,
	onDurationChange,
} ) => {
	const translate = useTranslate();

	const CALYPSO_MASTERBAR_HEIGHT = 47;
	const CLOUD_MASTERBAR_HEIGHT = 0;

	const windowBoundaryOffset = useMemo( () => {
		if ( isJetpackCloud() || isConnectStore() ) {
			return CLOUD_MASTERBAR_HEIGHT;
		}

		return CALYPSO_MASTERBAR_HEIGHT;
	}, [] );
	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const [ durationChecked, setDurationChecked ] = useState( duration === TERM_ANNUALLY );
	useEffect( () => {
		const selectedDuration = durationChecked ? TERM_ANNUALLY : TERM_MONTHLY;
		onDurationChange?.( selectedDuration );
	}, [ onDurationChange, durationChecked ] );

	return (
		<>
			<div className="plans-filter-bar__viewport-sentinel" ref={ barRef }></div>
			<div
				className={ classNames( 'plans-filter-bar', {
					sticky: hasCrossed,
				} ) }
			>
				<div className="plans-filter-bar__duration-toggle-wrapper">
					<div
						className={ classNames( 'plans-filter-bar__duration-toggle', {
							checked: durationChecked,
						} ) }
					>
						<span className="plans-filter-bar__toggle-off-label">
							{ translate( 'Bill monthly' ) }
						</span>
						<ToggleControl
							className="plans-filter-bar__toggle-control"
							checked={ durationChecked }
							onChange={ () => setDurationChecked( ( prevState ) => ! prevState ) }
						/>
						<span className="plans-filter-bar__toggle-on-label">
							{ translate( 'Bill yearly' ) }
						</span>
					</div>
					{ showDiscountMessage && <DiscountMessage toggleChecked={ durationChecked } /> }
				</div>
			</div>
		</>
	);
};

export default PlansFilterBar;
