import { Popover } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import SegmentedControl from 'calypso/components/segmented-control';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import type { ReactElement } from 'react';

import './style.scss';

interface BillingIntervalToggleProps {
	intervalLength: IntervalLength;
	onIntervalChange: ( newIntervalLength: IntervalLength ) => void;
}

export const BillingIntervalToggle = ( {
	intervalLength,
	onIntervalChange,
}: BillingIntervalToggleProps ): ReactElement => {
	const translate = useTranslate();
	const payAnnuallyButtonRef = useRef( null );

	const isMonthlyPlan = intervalLength === IntervalLength.MONTHLY;
	const isAnnuallyPlan = intervalLength === IntervalLength.ANNUALLY;

	return (
		<div className="billing-interval-toggle">
			<SegmentedControl compact primary>
				<SegmentedControl.Item
					selected={ isMonthlyPlan }
					onClick={ () => onIntervalChange( IntervalLength.MONTHLY ) }
				>
					<span>{ translate( 'Pay monthly' ) }</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ isAnnuallyPlan }
					onClick={ () => onIntervalChange( IntervalLength.ANNUALLY ) }
				>
					<span ref={ payAnnuallyButtonRef }>{ translate( 'Pay annually' ) }</span>
					{ [ 'right', 'bottom' ].map( ( pos ) => (
						<Popover
							isVisible={ isMonthlyPlan }
							position={ pos }
							autoPosition={ false }
							context={ payAnnuallyButtonRef.current }
							className="emails-save-paying-annually__popover"
						>
							{ translate( 'Save by paying annually' ) }
						</Popover>
					) ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
