/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';
import { Popover } from '@wordpress/components';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SegmentedControl from '../segmented-control';

/**
 * Style dependencies
 */
import './style.scss';

export type BillingIntervalType = 'yearly' | 'monthly';

type PopupMessageProps = {
	isVisible: boolean;
};

export const PopupMessages: React.FunctionComponent< PopupMessageProps > = ( {
	children,
	// isVisible,
} ) => {
	const positions: React.ComponentProps< typeof Popover >[ 'position' ][] = [
		'middle right',
		'bottom center',
	];

	return (
		<>
			{ positions.map( ( pos ) => (
				<Popover key={ pos } className="plans-interval-toggle__popover" position={ pos }>
					{ children }
				</Popover>
			) ) }
		</>
	);
};

type ToggleHostProps = {
	intervalType: BillingIntervalType;
	onChange: ( selectedValue: BillingIntervalType ) => void;
	maxSavingsPerc: number;
};

const PlansIntervalToggle: React.FunctionComponent< ToggleHostProps > = ( {
	onChange,
	intervalType,
	maxSavingsPerc,
} ) => {
	const { __ } = useI18n();

	const annuallySpanRef = React.useRef( null );

	const segmentClasses = classNames( 'plan-features__interval-type', 'price-toggle', {
		'is-monthly-selected': intervalType === 'monthly',
	} );

	return (
		<SegmentedControl compact className={ segmentClasses } primary={ true }>
			<SegmentedControl.Item
				selected={ intervalType === 'monthly' }
				onClick={ () => onChange( 'monthly' ) }
			>
				<span>{ __( 'Monthly', __i18n_text_domain__ ) }</span>
			</SegmentedControl.Item>

			<SegmentedControl.Item
				selected={ intervalType === 'yearly' }
				onClick={ () => onChange( 'yearly' ) }
			>
				<span ref={ annuallySpanRef }>{ __( 'Annually', __i18n_text_domain__ ) }</span>
				<PopupMessages isVisible={ intervalType === 'monthly' }>
					{ sprintf(
						__(
							'Save up to %s%% by paying annually and get a free domain for one year',
							__i18n_text_domain__
						),
						maxSavingsPerc
					) }
				</PopupMessages>
			</SegmentedControl.Item>
		</SegmentedControl>
	);
};

export default PlansIntervalToggle;
