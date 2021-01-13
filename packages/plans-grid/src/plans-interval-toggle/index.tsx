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

export type BillingIntervalType = 'yearly' | 'monthly';

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

type ToggleHostProps = {
	intervalType: BillingIntervalType;
	onChange: ( selectedValue: BillingIntervalType ) => void;
	maxSavingsPerc: number;
	className?: string;
};

const PlansIntervalToggle: React.FunctionComponent< ToggleHostProps > = ( {
	onChange,
	intervalType,
	maxSavingsPerc,
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
					{ intervalType === 'monthly' && (
						<PopupMessages>
							{ sprintf(
								// Translators: "%s" is a number, and "%%" is the percent sign. Please keep the "%s%%" string unchanged when translating.
								__(
									'Save up to %s%% by paying annually and get a free domain for one year',
									__i18n_text_domain__
								),
								maxSavingsPerc
							) }
						</PopupMessages>
					) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};

export default PlansIntervalToggle;
