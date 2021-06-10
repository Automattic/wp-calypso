/**
 * External dependencies
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import classNames from 'classnames';
import { ToggleControl } from '@wordpress/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';

/**
 * Internal dependencies
 */
import {
	JETPACK_PRODUCTS_BY_TERM,
	JETPACK_RESET_PLANS_BY_TERM,
	TERM_MONTHLY,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import useDetectWindowBoundary from '../use-detect-window-boundary';
import { getHighestAnnualDiscount } from '../utils';

/**
 * Type dependencies
 */
import type { Duration, DurationChangeCallback } from '../types';

/**
 * Style dependencies
 */
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

	const slugsToCheck = [
		...JETPACK_PRODUCTS_BY_TERM.map( ( s ) => s.yearly ),
		...JETPACK_RESET_PLANS_BY_TERM.map( ( s ) => s.yearly ),
	];

	const highestAnnualDiscount = useSelector( ( state ) =>
		getHighestAnnualDiscount( state, slugsToCheck )
	);

	if ( ! highestAnnualDiscount ) {
		return null;
	}

	return toggleChecked ? (
		<div
			className={ classNames( 'plans-filter-bar__discount-message', {
				toggleChecked,
			} ) }
		>
			<div>
				<span className="plans-filter-bar__discount-message-text">
					{ isMobile
						? translate( 'Save %(discount)s by paying yearly', {
								args: { discount: highestAnnualDiscount },
								comment: 'Discount is either a currency-formatted number or percentage',
						  } )
						: translate( 'Save %(discount)s', {
								args: { discount: highestAnnualDiscount },
								comment: 'Discount is either a currency-formatted number or percentage',
						  } ) }
				</span>
				{ String.fromCodePoint( 0x1f389 ) } { /* Celebration emoji 🎉 */ }
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
