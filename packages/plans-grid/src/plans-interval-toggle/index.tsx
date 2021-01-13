/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
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

type ToggleHostProps = {
	intervalType: BillingIntervalType;
	onChange: ( selectedValue: BillingIntervalType ) => void;
	maxSavingsPerc: number;
	className?: string;
};

const PlansIntervalToggle: React.FunctionComponent< ToggleHostProps > = ( {
	onChange,
	intervalType,
	className = '',
} ) => {
	const { __ } = useI18n();

	return (
		<div
			className={ classNames(
				'plans-interval-toggle',
				{ 'plans-interval-toggle--monthly': intervalType === 'monthly' },
				className
			) }
		>
			<SegmentedControl>
				<SegmentedControl.Item
					selected={ intervalType === 'monthly' }
					onClick={ () => onChange( 'monthly' ) }
				>
					{ __( 'Monthly', __i18n_text_domain__ ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalType === 'yearly' }
					onClick={ () => onChange( 'yearly' ) }
				>
					{ __( 'Annually', __i18n_text_domain__ ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};

export default PlansIntervalToggle;
