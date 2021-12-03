import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import { TermLength } from '../provider-cards/utils';

import './style.scss';

interface BillingSelectorProps {
	termLength: TermLength;
	onTermTypeChange: ( term: TermLength ) => void;
}

export const BillingSelector: FunctionComponent< BillingSelectorProps > = ( props ) => {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const { onTermTypeChange = () => {}, termLength } = props;
	const translate = useTranslate();
	const onTermClick = ( termLength: TermLength ) => {
		return () => onTermTypeChange( termLength );
	};

	return (
		<div className="billing-selector__wrapper">
			<SegmentedControl compact className={ 'billing-selector__wrapper' } primary={ true }>
				<SegmentedControl.Item
					selected={ termLength === TermLength.MONTHLY }
					onClick={ onTermClick( TermLength.MONTHLY ) }
				>
					<span>{ translate( 'Pay monthly' ) }</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ termLength === TermLength.ANNUALLY }
					onClick={ onTermClick( TermLength.ANNUALLY ) }
				>
					<span>{ translate( 'Pay annually' ) }</span>
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
