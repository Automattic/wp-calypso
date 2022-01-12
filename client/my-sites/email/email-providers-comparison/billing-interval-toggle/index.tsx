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

	return (
		<div className="billing-interval-toggle">
			<SegmentedControl compact primary>
				<SegmentedControl.Item
					selected={ intervalLength === IntervalLength.MONTHLY }
					onClick={ () => onIntervalChange( IntervalLength.MONTHLY ) }
				>
					<span>{ translate( 'Pay monthly' ) }</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalLength === IntervalLength.ANNUALLY }
					onClick={ () => onIntervalChange( IntervalLength.ANNUALLY ) }
				>
					<span>{ translate( 'Pay annually' ) }</span>
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
