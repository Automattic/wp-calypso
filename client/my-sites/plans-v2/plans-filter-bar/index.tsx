/**
 * External dependencies
 */
import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import classNames from 'classnames';

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
import SegmentedControl from 'calypso/components/segmented-control';
import SelectDropdown from 'calypso/components/select-dropdown';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { TERM_MONTHLY, TERM_ANNUALLY } from 'calypso/lib/plans/constants';
import { masterbarIsVisible } from 'calypso/state/ui/selectors';
import { getJetpackCROActiveVersion } from '../abtest';
import { PRODUCT_TYPE_OPTIONS } from '../constants';
import useDetectWindowBoundary from '../use-detect-window-boundary';
import { getHighestAnnualDiscount } from '../utils';

/**
 * Type dependencies
 */
import type { Duration, ProductType } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	showDiscountMessage?: boolean;
	showDurations?: boolean;
	showProductTypes?: boolean;
	duration?: Duration;
	productType?: ProductType;
	onDurationChange?: ( arg0: Duration ) => void;
	onProductTypeChange?: ( arg0: ProductType ) => void;
}

const CALYPSO_MASTERBAR_HEIGHT = 47;
const CLOUD_MASTERBAR_HEIGHT = 94;

const REALTIME_PRODUCTS = [ PLAN_JETPACK_SECURITY_REALTIME, PRODUCT_JETPACK_BACKUP_REALTIME ];

const DiscountMessage = () => {
	const translate = useTranslate();

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
		<span className="plans-filter-bar__discount-message">
			{ translate( 'You save up to %(discount)s by paying yearly', {
				args: { discount: highestAnnualDiscount },
				comment: 'Discount is either a currency-formatted number or percentage',
			} ) }
		</span>
	);
};

const PlansFilterBar = ( {
	showDiscountMessage,
	showDurations,
	showProductTypes,
	duration,
	productType,
	onDurationChange,
	onProductTypeChange,
}: Props ) => {
	const translate = useTranslate();
	const isCloud = isJetpackCloud();
	const masterbarSelector = isCloud ? '.jpcom-masterbar' : '.masterbar';
	const masterbarDefaultHeight = isCloud ? CLOUD_MASTERBAR_HEIGHT : CALYPSO_MASTERBAR_HEIGHT;

	const isMasterbarVisible = useSelector( masterbarIsVisible );
	// if we can find the masterbar in the DOM, get its height directly from the element.
	const masterbarHeight =
		document.querySelector( masterbarSelector )?.offsetHeight || masterbarDefaultHeight;
	const masterbarOffset = isMasterbarVisible || isCloud ? masterbarHeight : 0;
	const [ barRef, hasCrossed ] = useDetectWindowBoundary( masterbarOffset );

	return (
		<div ref={ barRef } className={ classNames( 'plans-filter-bar', { sticky: hasCrossed } ) }>
			{ showProductTypes && (
				<SelectDropdown selectedText={ productType && PRODUCT_TYPE_OPTIONS[ productType ].label }>
					{ Object.values( PRODUCT_TYPE_OPTIONS ).map( ( option ) => (
						<SelectDropdown.Item
							key={ option.id }
							selected={ productType === option.id }
							onClick={ () => onProductTypeChange?.( option.id ) }
						>
							{ option.label }
						</SelectDropdown.Item>
					) ) }
				</SelectDropdown>
			) }
			{ showDurations && (
				<SegmentedControl primary={ true }>
					<SegmentedControl.Item
						onClick={ () => onDurationChange?.( TERM_MONTHLY ) }
						selected={ duration === TERM_MONTHLY }
					>
						{ translate( 'Monthly' ) }
					</SegmentedControl.Item>

					<SegmentedControl.Item
						onClick={ () => onDurationChange?.( TERM_ANNUALLY ) }
						selected={ duration === TERM_ANNUALLY }
					>
						{ translate( 'Yearly' ) }
					</SegmentedControl.Item>
				</SegmentedControl>
			) }
			{ showDiscountMessage && <DiscountMessage /> }
		</div>
	);
};

export default PlansFilterBar;
