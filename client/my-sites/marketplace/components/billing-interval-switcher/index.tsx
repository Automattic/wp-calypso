import config from '@automattic/calypso-config';
import { PlansIntervalToggle } from '@automattic/plans-grid/src';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import SelectDropdown from 'calypso/components/select-dropdown';
import { PluginAnnualSaving } from 'calypso/my-sites/plugins/plugin-saving';
import { IntervalLength } from './constants';
import type { FunctionComponent } from 'react';

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

const BillingIntervalSwitcherContainer = styled.div`
	display: flex;
	margin-top: -4px;
	margin-bottom: 16px;
`;

const RadioButton = styled( FormRadio )`
	&:checked:before {
		background-color: var( --studio-gray-80 );
	}
`;

const RadioButtonLabel = styled( FormLabel )`
	color: var( --studio-gray-60 );

	&:first-child {
		margin-right: 15px;
	}
`;

type Props = {
	onChange: ( selectedValue: 'MONTHLY' | 'ANNUALLY' ) => void;
	billingPeriod: IntervalLength;
	compact: boolean;
	plugin?: {
		variations?: {
			yearly?: { product_slug?: string; product_id?: number };
			monthly?: { product_slug?: string; product_id?: number };
		};
	};
};

const BillingIntervalSwitcher: FunctionComponent< Props > = ( props: Props ) => {
	const legacyVersion = ! config.isEnabled( 'plugins/plugin-details-layout' );

	const { billingPeriod, onChange, plugin } = props;

	const translate = useTranslate();
	const monthlyLabel = translate( 'Monthly' );
	const annualLabel = translate( 'Annually' );

	if ( legacyVersion ) {
		return <LegacyBillingIntervalSwitcher { ...props } />;
	}

	return (
		<BillingIntervalSwitcherContainer>
			<RadioButtonLabel>
				<RadioButton
					className="billing-interval-switcher__monthly-option"
					checked={ billingPeriod === IntervalLength.MONTHLY }
					onChange={ () => onChange( IntervalLength.MONTHLY ) }
					label={ monthlyLabel }
				/>
			</RadioButtonLabel>
			<RadioButtonLabel>
				<RadioButton
					className="billing-interval-switcher__yearly-option"
					checked={ billingPeriod === IntervalLength.ANNUALLY }
					onChange={ () => onChange( IntervalLength.ANNUALLY ) }
					label={
						<>
							{ annualLabel }
							<PluginAnnualSaving plugin={ plugin }>
								{ ( annualSaving: { saving: string | null } ) =>
									annualSaving.saving && (
										<PluginAnnualSavingLabelMobile isSelected={ false }>
											&nbsp;(-{ annualSaving.saving })
										</PluginAnnualSavingLabelMobile>
									)
								}
							</PluginAnnualSaving>
						</>
					}
				/>
			</RadioButtonLabel>
		</BillingIntervalSwitcherContainer>
	);
};

function LegacyBillingIntervalSwitcher( { billingPeriod, onChange, compact, plugin }: Props ) {
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
								{ ( annualSaving: { saving: string | null } ) =>
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
						{ ( annualSaving: { saving: string | null } ) =>
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
}
export default BillingIntervalSwitcher;
