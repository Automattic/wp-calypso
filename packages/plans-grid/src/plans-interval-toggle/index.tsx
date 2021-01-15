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
import SegmentedControl from '../segmented-control';

/**
 * Style dependencies
 */
import './style.scss';

// TODO: import this type directly from plans data-store once
// https://github.com/Automattic/wp-calypso/pull/48790 is merged
export type BillingIntervalType = 'MONTHLY' | 'ANNUALLY';

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
	intervalType: BillingIntervalType;
	onChange: ( selectedValue: BillingIntervalType ) => void;
	maxMonhtlyDiscountPercentage?: number;
	className?: string;
}

const PlansIntervalToggle: React.FunctionComponent< PlansIntervalToggleProps > = ( {
	onChange,
	intervalType,
	maxMonhtlyDiscountPercentage,
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
						{ __( 'Monthly', __i18n_text_domain__ ) }
					</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalType === 'ANNUALLY' }
					onClick={ () => onChange( 'ANNUALLY' ) }
				>
					<span className="plans-interval-toggle__label">
						{ __( 'Annually', __i18n_text_domain__ ) }
					</span>
					{ intervalType === 'MONTHLY' && typeof maxMonhtlyDiscountPercentage !== undefined && (
						<PopupMessages>
							{ sprintf(
								// Translators: "%s" is a number, and "%%" is the percent sign. Please keep the "%s%%" string unchanged when translating.
								__(
									'Save up to %s%% by paying annually and get a free domain for one year',
									__i18n_text_domain__
								),
								maxMonhtlyDiscountPercentage
							) }
						</PopupMessages>
					) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};

export default PlansIntervalToggle;
