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
import { JETPACK_PRODUCTS_BY_TERM } from 'calypso/lib/products-values/constants';
import { JETPACK_RESET_PLANS_BY_TERM } from 'calypso/lib/plans/constants';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isConnectStore } from 'calypso/my-sites/plans/jetpack-plans/product-grid/utils';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'calypso/lib/plans/constants';
import useDetectWindowBoundary from '../use-detect-window-boundary';
import { getHighestAnnualDiscount } from '../utils';

/**
 * Type dependencies
 */
import type { Duration, DurationChangeCallback, ProductType } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

interface FilterBarProps {
	showDiscountMessage?: boolean;
	showDurations?: boolean;
	duration?: Duration;
	onDurationChange?: DurationChangeCallback;
	onProductTypeChange?: ( arg0: ProductType ) => void;
	withTreatmentVariant: boolean;
}

type DiscountMessageProps = {
	primary?: boolean;
	withTreatmentVariant: boolean;
};

const CLOUD_MASTERBAR_STICKY = false;
const CALYPSO_MASTERBAR_HEIGHT = 47;
const CLOUD_MASTERBAR_HEIGHT = CLOUD_MASTERBAR_STICKY ? 94 : 0;

const DiscountMessage: React.FC< DiscountMessageProps > = ( { primary, withTreatmentVariant } ) => {
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

	return (
		<div
			className={ classNames( 'plans-filter-bar-i5__discount-message', {
				primary,
				treatment: withTreatmentVariant,
			} ) }
		>
			<div>
				<span className="plans-filter-bar-i5__discount-message-text">
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
	);
};

const PlansFilterBarI5: React.FC< FilterBarProps > = ( {
	showDiscountMessage,
	duration,
	onDurationChange,
	withTreatmentVariant,
} ) => {
	const translate = useTranslate();
	const isInConnectStore = useMemo( isConnectStore, [] );
	const isInJetpackCloud = useMemo( isJetpackCloud, [] );
	const windowBoundaryOffset =
		isInJetpackCloud || isInConnectStore ? CLOUD_MASTERBAR_HEIGHT : CALYPSO_MASTERBAR_HEIGHT;
	const [ barRef, hasCrossed ] = useDetectWindowBoundary( windowBoundaryOffset );

	const [ durationChecked, setDurationChecked ] = useState(
		duration === TERM_ANNUALLY ? true : false
	);

	useEffect( () => {
		const selectedDuration = durationChecked ? TERM_ANNUALLY : TERM_MONTHLY;
		onDurationChange?.( selectedDuration );
	}, [ onDurationChange, durationChecked ] );

	return (
		<div ref={ barRef } className={ classNames( 'plans-filter-bar-i5', { sticky: hasCrossed } ) }>
			<div
				className={ classNames( 'plans-filter-bar-i5__duration-toggle', {
					checked: durationChecked,
				} ) }
			>
				<span className="plans-filter-bar-i5__toggle-off-label">
					{ translate( 'Bill monthly' ) }
				</span>
				<ToggleControl
					className="plans-filter-bar-i5__toggle-control"
					checked={ durationChecked }
					onChange={ () => setDurationChecked( ( prevState ) => ! prevState ) }
				/>
				<span className="plans-filter-bar-i5__toggle-on-label">{ translate( 'Bill yearly' ) }</span>
			</div>
			{ showDiscountMessage && (
				<DiscountMessage
					primary={ durationChecked }
					withTreatmentVariant={ withTreatmentVariant }
				/>
			) }
		</div>
	);
};

export default PlansFilterBarI5;
