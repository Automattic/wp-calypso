/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { sprintf } from '@wordpress/i18n';
import { Popover } from '@wordpress/components';
import classNames from 'classnames';
import type { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import SegmentedControl from '../segmented-control';

/**
 * Style dependencies
 */
import './style.scss';

export const PopupMessages: React.FunctionComponent = ( { children } ) => {
	const variants: Record< string, React.ComponentProps< typeof Popover >[ 'position' ] > = {
		desktop: 'middle right',
		mobile: 'bottom center',
	};

	return (
		<>
			{ Object.keys( variants ).map( ( variant ) => (
				<Popover
					key={ variant }
					className={ classNames(
						'plans-interval-toggle__popover',
						`plans-interval-toggle__popover--${ variant }`
					) }
					position={ variants[ variant ] }
					noArrow={ false }
				>
					{ children }
				</Popover>
			) ) }
		</>
	);
};

interface PlansIntervalToggleProps {
	intervalType: Plans.PlanBillingPeriod;
	onChange: ( selectedValue: Plans.PlanBillingPeriod ) => void;
	maxMonthlyDiscountPercentage?: number;
	className?: string;
}

const PlansIntervalToggle: React.FunctionComponent< PlansIntervalToggleProps > = ( {
	onChange,
	intervalType,
	maxMonthlyDiscountPercentage,
	className = '',
} ) => {
	const { __ } = useI18n();

	return (
		<div
			className={ classNames(
				'plans-interval-toggle',
				{ 'plans-interval-toggle--monthly': intervalType === 'MONTHLY' },
				className
			) }
		>
			<SegmentedControl>
				<SegmentedControl.Item
					selected={ intervalType === 'MONTHLY' }
					onClick={ () => onChange( 'MONTHLY' ) }
				>
					<span className="plans-interval-toggle__label">
						{ /* Translators: intended as "pay monthly", as opposed to "pay annually" */ }
						{ __( 'Monthly', __i18n_text_domain__ ) }
					</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalType === 'ANNUALLY' }
					onClick={ () => onChange( 'ANNUALLY' ) }
				>
					<span className="plans-interval-toggle__label">
						{ /* Translators: intended as "pay annually", as opposed to "pay monthly" */ }
						{ __( 'Annually', __i18n_text_domain__ ) }
					</span>
					{ /*
					 * Check covers both cases of maxMonthlyDiscountPercentage
					 * not being undefined and not being 0
					 */ }
					{ intervalType === 'MONTHLY' && maxMonthlyDiscountPercentage && (
						<PopupMessages>
							{ sprintf(
								// translators: will be like "Save up to 30% by paying annually...". Please keep "%%" for the percent sign
								__(
									'Save up to %(maxDiscount)d%% by paying annually and get a free domain for one year',
									__i18n_text_domain__
								),
								{ maxDiscount: maxMonthlyDiscountPercentage }
							) }
						</PopupMessages>
					) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};

export default PlansIntervalToggle;
