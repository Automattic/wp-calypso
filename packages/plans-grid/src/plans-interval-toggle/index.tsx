import { useLocale } from '@automattic/i18n-utils';
import { Popover } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState } from 'react';
import * as React from 'react';
import SegmentedControl from '../segmented-control';
import type { Plans } from '@automattic/data-stores';

import './style.scss';

interface PopupMessagesProps {
	anchorRect?: DOMRect;
	children: React.ReactNode;
}

export const PopupMessages: React.FunctionComponent< PopupMessagesProps > = ( {
	anchorRect,
	children,
} ) => {
	const variants: Record< string, React.ComponentProps< typeof Popover >[ 'position' ] > = {
		desktop: 'middle right',
		mobile: 'bottom center',
	};

	return (
		<>
			{ Object.keys( variants ).map( ( variant ) => (
				<Popover
					key={ variant }
					className={ clsx(
						'plans-interval-toggle__popover',
						`plans-interval-toggle__popover--${ variant }`
					) }
					position={ variants[ variant ] }
					noArrow={ false }
					anchorRect={ anchorRect }
				>
					{ children }
				</Popover>
			) ) }
		</>
	);
};

export interface PlansIntervalToggleProps {
	intervalType: Plans.PlanBillingPeriod;
	onChange: ( selectedValue: Plans.PlanBillingPeriod ) => void;
	maxMonthlyDiscountPercentage?: number;
	className?: string;
	children?: React.ReactNode;
}

const PlansIntervalToggle: React.FunctionComponent< PlansIntervalToggleProps > = ( {
	onChange,
	intervalType,
	maxMonthlyDiscountPercentage,
	className = '',
	children,
} ) => {
	const { __, _x, hasTranslation } = useI18n();
	const locale = useLocale();
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();

	const fallbackMonthlyLabel = __( 'Pay monthly', __i18n_text_domain__ );
	// Translators: intended as "pay monthly", as opposed to "pay annually"
	const newMonthlyLabel = _x( 'Monthly', 'Adverb (as in "Pay monthly")', __i18n_text_domain__ );
	const monthlyLabel =
		locale === 'en' ||
		hasTranslation( 'Monthly', 'Adverb (as in "Pay monthly")', __i18n_text_domain__ )
			? newMonthlyLabel
			: fallbackMonthlyLabel;

	const fallbackAnnuallyLabel = __( 'Pay annually', __i18n_text_domain__ );
	// Translators: intended as "pay annually", as opposed to "pay monthly"
	const newAnnuallyLabel = _x( 'Annually', 'Adverb (as in "Pay annually")', __i18n_text_domain__ );
	const annuallyLabel =
		locale === 'en' ||
		hasTranslation( 'Annually', 'Adverb (as in "Pay annually")', __i18n_text_domain__ )
			? newAnnuallyLabel
			: fallbackAnnuallyLabel;

	return (
		<div
			className={ clsx(
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
					<span className="plans-interval-toggle__label">{ monthlyLabel }</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalType === 'ANNUALLY' }
					onClick={ () => onChange( 'ANNUALLY' ) }
				>
					<span
						className="plans-interval-toggle__label"
						ref={ ( ref ) => ref && setSpanRef( ref ) }
					>
						{ annuallyLabel } { children }
					</span>

					{ /*
					 * Check covers both cases of maxMonthlyDiscountPercentage
					 * not being undefined and not being 0
					 */ }
					{ intervalType === 'MONTHLY' && maxMonthlyDiscountPercentage && (
						<PopupMessages anchorRect={ spanRef?.getBoundingClientRect() }>
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
