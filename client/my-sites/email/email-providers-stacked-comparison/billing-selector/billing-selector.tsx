import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';

import './style.scss';

interface BillingSelectorProps {
	onTermTypeChange: ( term: string ) => void;
}

export const BillingSelector: FunctionComponent< BillingSelectorProps > = ( props ) => {
	const [ termLength, setTermLength ] = useState( 'monthly' );
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const { onTermTypeChange = () => {} } = props;
	const translate = useTranslate();
	const termChange = ( termLength: string ) => {
		return () => {
			setTermLength( termLength );
			onTermTypeChange( termLength );
		};
	};

	return (
		<div className="billing-selector__wrapper">
			<SegmentedControl compact className={ 'billing-selector__wrapper' } primary={ true }>
				<SegmentedControl.Item
					selected={ termLength === 'monthly' }
					onClick={ termChange( 'monthly' ) }
				>
					<span>{ translate( 'Pay monthly' ) }</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ termLength === 'yearly' }
					onClick={ termChange( 'yearly' ) }
				>
					<span>{ translate( 'Pay annually' ) }</span>
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};
