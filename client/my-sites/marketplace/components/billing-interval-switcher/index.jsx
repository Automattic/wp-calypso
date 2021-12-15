import { PlansIntervalToggle } from '@automattic/plans-grid/src';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import SelectDropdown from 'calypso/components/select-dropdown';

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

const BillingIntervalSwitcher = ( { billingPeriod, onChange, compact } ) => {
	const translate = useTranslate();

	if ( compact ) {
		return (
			<SelectDropdown
				selectedText={
					billingPeriod === 'MONTHLY' ? translate( 'Monthly price' ) : translate( 'Annual price' )
				}
			>
				<SelectDropdown.Item
					selected={ billingPeriod === 'MONTHLY' }
					onClick={ () => onChange( 'MONTHLY' ) }
				>
					{ translate( 'Monthly price' ) }
				</SelectDropdown.Item>
				<SelectDropdown.Item
					selected={ billingPeriod === 'ANNUALLY' }
					onClick={ () => onChange( 'ANNUALLY' ) }
				>
					{ translate( 'Annual price' ) }
				</SelectDropdown.Item>
			</SelectDropdown>
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
