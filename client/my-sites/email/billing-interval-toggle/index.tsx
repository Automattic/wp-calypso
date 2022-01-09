import { useTranslate } from 'i18n-calypso';
import SegmentedControl from 'calypso/components/segmented-control';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import type { ReactElement } from 'react';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface BillingIntervalToggleProps {
	intervalLength: IntervalLength;
	onIntervalChange: ( newIntervalLength: IntervalLength ) => void;
}

export const BillingIntervalToggle = ( {
	intervalLength,
	onIntervalChange = noop,
}: BillingIntervalToggleProps ): ReactElement => {
	const translate = useTranslate();

	const onIntervalClick = ( newIntervalLength: IntervalLength ) => {
		return () => onIntervalChange( newIntervalLength );
	};

	return (
		<div className="billing-interval-toggle">
			<SegmentedControl compact primary>
				<SegmentedControl.Item
					selected={ intervalLength === IntervalLength.MONTHLY }
					onClick={ onIntervalClick( IntervalLength.MONTHLY ) }
				>
					<span>{ translate( 'Pay monthly' ) }</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalLength === IntervalLength.ANNUALLY }
					onClick={ onIntervalClick( IntervalLength.ANNUALLY ) }
				>
					<span>{ translate( 'Pay annually' ) }</span>
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
