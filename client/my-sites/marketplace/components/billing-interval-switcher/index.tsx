import { PlansIntervalToggle } from '@automattic/plans-grid/src';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import SelectDropdown from 'calypso/components/select-dropdown';
import { IntervalLength } from './constants';

const Container = styled.div`
	.plans-interval-toggle {
		display: inline-flex;
	}
`;

const PlansIntervalToggleLabel = styled.span`
	font-size: 14px;
	color: var( --studio-gray-60 );
	margin-right: 10px;
`;

type Props = {
	onChange: ( selectedValue: 'MONTHLY' | 'ANNUALLY' ) => void;
	billingPeriod: IntervalLength;
	compact: boolean;
};

const BillingIntervalSwitcher: React.FunctionComponent< Props > = ( {
	billingPeriod,
	onChange,
	compact,
} ) => {
	const translate = useTranslate();
	const monthlyLabel = translate( 'Monthly price' );
	const annualLabel = translate( 'Annual price' );

	if ( compact ) {
		return (
			<Container>
				<SelectDropdown
					selectedText={ billingPeriod === IntervalLength.MONTHLY ? monthlyLabel : annualLabel }
				>
					<SelectDropdown.Item
						selected={ billingPeriod === IntervalLength.MONTHLY }
						onClick={ () => onChange( IntervalLength.MONTHLY ) }
					>
						{ monthlyLabel }
					</SelectDropdown.Item>
					<SelectDropdown.Item
						selected={ billingPeriod === IntervalLength.ANNUALLY }
						onClick={ () => onChange( IntervalLength.ANNUALLY ) }
					>
						{ annualLabel }
					</SelectDropdown.Item>
				</SelectDropdown>
			</Container>
		);
	}

	return (
		<Container>
			<PlansIntervalToggleLabel>{ translate( 'Price' ) }</PlansIntervalToggleLabel>
			<PlansIntervalToggle intervalType={ billingPeriod } onChange={ onChange } />
		</Container>
	);
};
export default BillingIntervalSwitcher;
