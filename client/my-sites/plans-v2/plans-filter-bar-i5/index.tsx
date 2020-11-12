/**
 * External dependencies
 */
import React, { useMemo, useRef, useState, useEffect } from 'react';
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
	PRODUCT_JETPACK_BACKUP_REALTIME,
} from 'calypso/lib/products-values/constants';
import {
	JETPACK_RESET_PLANS_BY_TERM,
	PLAN_JETPACK_SECURITY_REALTIME,
} from 'calypso/lib/plans/constants';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'calypso/lib/plans/constants';
import { masterbarIsVisible } from 'calypso/state/ui/selectors';
import { getJetpackCROActiveVersion } from '../abtest';
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
}

type DiscountMessageProps = {
	primary?: boolean;
};

const CALYPSO_MASTERBAR_HEIGHT = 47;
const CLOUD_MASTERBAR_HEIGHT = 94;

const REALTIME_PRODUCTS = [ PLAN_JETPACK_SECURITY_REALTIME, PRODUCT_JETPACK_BACKUP_REALTIME ];

const DiscountMessage: React.FC< DiscountMessageProps > = ( { primary } ) => {
	const translate = useTranslate();
	const isMobile: boolean = useMobileBreakpoint();

	const croVersion = getJetpackCROActiveVersion();
	const slugsToCheck = useMemo(
		() =>
			[
				...JETPACK_PRODUCTS_BY_TERM.map( ( s ) => s.yearly ),
				...JETPACK_RESET_PLANS_BY_TERM.map( ( s ) => s.yearly ),
			].filter( ( slug ) => {
				// Don't factor in real-time products for CRO v1 --
				// they're not visible in the product grid
				if ( croVersion === 'v1' && REALTIME_PRODUCTS.includes( slug ) ) {
					return false;
				}

				return true;
			} ),
		[ croVersion ]
	);
	const highestAnnualDiscount = useSelector( ( state ) =>
		getHighestAnnualDiscount( state, slugsToCheck )
	);

	if ( ! highestAnnualDiscount ) {
		return null;
	}

	return (
		<div className={ classNames( 'plans-filter-bar-i5__discount-message', { primary: primary } ) }>
			<div>
				<span className="plans-filter-bar-i5__discount-message-text">
					{ isMobile
						? translate( 'SAVE %(discount)s BY PAYING YEARLY', {
								args: { discount: highestAnnualDiscount },
								comment: 'Discount is either a currency-formatted number or percentage',
						  } )
						: translate( 'SAVE %(discount)s', {
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
} ) => {
	const isCloud = isJetpackCloud();
	const masterbarSelector = isCloud ? '.jpcom-masterbar' : '.masterbar';
	const masterbarDefaultHeight = isCloud ? CLOUD_MASTERBAR_HEIGHT : CALYPSO_MASTERBAR_HEIGHT;

	const barRef = useRef< HTMLDivElement | null >( null );
	const isMasterbarVisible = useSelector( masterbarIsVisible );
	// if we can find the masterbar in the DOM, get its height directly from the element.
	const masterbarHeight =
		document.querySelector( masterbarSelector )?.offsetHeight || masterbarDefaultHeight;
	const masterbarOffset = isMasterbarVisible || isCloud ? masterbarHeight : 0;
	const hasCrossed = useDetectWindowBoundary( barRef, masterbarOffset );

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
				<span className="plans-filter-bar-i5__toggle-off-label">Bill monthly</span>
				<ToggleControl
					className="plans-filter-bar-i5__toggle-control"
					checked={ durationChecked }
					onChange={ () => setDurationChecked( ( prevState ) => ! prevState ) }
				/>
				<span className="plans-filter-bar-i5__toggle-on-label">Bill yearly</span>
			</div>
			{ showDiscountMessage && <DiscountMessage primary={ durationChecked } /> }
		</div>
	);
};

export default PlansFilterBarI5;
