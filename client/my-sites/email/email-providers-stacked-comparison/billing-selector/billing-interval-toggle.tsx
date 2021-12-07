import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import { IntervalLength } from '../provider-cards/utils';

import './style.scss';

interface BillingIntervalToggleProps {
	intervalLength: IntervalLength;
	onIntervalChange: ( term: IntervalLength ) => void;
}

export const BillingIntervalToggle: FunctionComponent< BillingIntervalToggleProps > = ( props ) => {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const { onIntervalChange = () => {}, intervalLength } = props;
	const translate = useTranslate();
	const onIntervalClick = ( intervalLength: IntervalLength ) => {
		return () => onIntervalChange( intervalLength );
	};

	return (
		<>
			<SegmentedControl className="billing-interval-toggle__wrapper" compact primary>
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
		</>
	);
};
