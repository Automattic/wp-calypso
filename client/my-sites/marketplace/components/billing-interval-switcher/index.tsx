import { PlansIntervalToggle } from '@automattic/plans-grid/src';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import { PluginAnnualSaving } from 'calypso/my-sites/plugins/plugin-saving';
import { IntervalLength } from './constants';

type PluginAnnualSavingLabelProps = {
	isSelected: boolean;
};
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

const PluginAnnualSavingLabelMobile = styled.span< PluginAnnualSavingLabelProps >`
	color: ${ ( props ) =>
		props.isSelected ? 'var( --studio-white-100 )' : 'var( --studio-green-60 )' };
`;

const PluginAnnualSavingLabelDesktop = styled.span`
	font-size: 12px;
	color: var( --studio-green-60 );
`;

type Props = {
	onChange: ( selectedValue: 'MONTHLY' | 'ANNUALLY' ) => void;
	billingPeriod: IntervalLength;
	compact: boolean;
	plugin?: object;
};

const BillingIntervalSwitcher: FunctionComponent< Props > = ( {
	billingPeriod,
	onChange,
	compact,
	plugin,
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
						{ plugin && (
							<PluginAnnualSaving plugin={ plugin }>
								{ ( annualSaving: { saving: never } ) =>
									annualSaving.saving && (
										<PluginAnnualSavingLabelMobile
											isSelected={ billingPeriod === IntervalLength.ANNUALLY }
										>
											&nbsp;-{ annualSaving.saving }
										</PluginAnnualSavingLabelMobile>
									)
								}
							</PluginAnnualSaving>
						) }
					</SelectDropdown.Item>
				</SelectDropdown>
			</Container>
		);
	}

	return (
		<Container>
			<PlansIntervalToggleLabel>{ translate( 'Price' ) }</PlansIntervalToggleLabel>
			<PlansIntervalToggle intervalType={ billingPeriod } onChange={ onChange }>
				{ plugin && (
					<PluginAnnualSaving plugin={ plugin }>
						{ ( annualSaving: { saving: never } ) =>
							annualSaving.saving && (
								<PluginAnnualSavingLabelDesktop>
									&nbsp;
									{ translate( 'Save %(save)s', {
										comment: 'Sale price label, ex: Save $51',
										args: { save: annualSaving.saving },
									} ) }
								</PluginAnnualSavingLabelDesktop>
							)
						}
					</PluginAnnualSaving>
				) }
			</PlansIntervalToggle>
		</Container>
	);
};
export default BillingIntervalSwitcher;
