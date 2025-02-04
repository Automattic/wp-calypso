import { Popover, SegmentedControl } from '@automattic/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';

import './style.scss';

interface BillingIntervalToggleProps {
	intervalLength: IntervalLength;
	onIntervalChange: ( newIntervalLength: IntervalLength ) => void;
}

export const BillingIntervalToggle = ( {
	intervalLength,
	onIntervalChange,
}: BillingIntervalToggleProps ) => {
	const translate = useTranslate();
	const [ payAnnuallyButtonRef, setPayAnnuallyButtonRef ] = useState< HTMLSpanElement | null >(
		null
	);

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
					<span ref={ setPayAnnuallyButtonRef }>{ translate( 'Pay annually' ) }</span>
					{ [ 'right', 'bottom' ].map( ( position ) => (
						<Popover
							isVisible={ isMonthlyPlan }
							position={ position }
							key={ position }
							autoPosition={ false }
							context={ payAnnuallyButtonRef }
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
