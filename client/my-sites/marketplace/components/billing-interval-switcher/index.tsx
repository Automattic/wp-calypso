import { FormLabel } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, type FunctionComponent } from 'react';
import FormRadio from 'calypso/components/forms/form-radio';
import { PluginAnnualSaving } from 'calypso/my-sites/plugins/plugin-saving';
import { IntervalLength } from './constants';

type PluginAnnualSavingLabelProps = {
	isSelected: boolean;
};

const PluginAnnualSavingLabelMobile = styled.span< PluginAnnualSavingLabelProps >`
	color: ${ ( props ) =>
		props.isSelected ? 'var( --studio-white-100 )' : 'var( --studio-green-60 )' };
`;

const BillingIntervalSwitcherContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
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

	&:first-of-type {
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
	const { billingPeriod, onChange, plugin } = props;

	const translate = useTranslate();
	const monthlyLabel = translate( 'Monthly' );
	const annualLabel = translate( 'Annually' );
	const saveLabel = translate( 'Save', { context: 'save money' } );

	const searchParams = new URLSearchParams(
		typeof document !== 'undefined' ? document.location.search : ''
	);
	const billingIntervalParam = searchParams.get( 'interval' );

	/**
	 * Change the billing period based on query params, if passed
	 */
	useEffect( () => {
		if ( billingIntervalParam === 'monthly' ) {
			onChange( IntervalLength.MONTHLY );
		}

		if ( billingIntervalParam === 'annually' ) {
			onChange( IntervalLength.ANNUALLY );
		}
	}, [ onChange, billingIntervalParam ] );

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
							<PluginAnnualSaving
								plugin={ plugin }
								renderContent={ ( annualSaving ) =>
									annualSaving.saving && (
										<PluginAnnualSavingLabelMobile isSelected={ false }>
											&nbsp;({ saveLabel } { annualSaving.saving })
										</PluginAnnualSavingLabelMobile>
									)
								}
							/>
						</>
					}
				/>
			</RadioButtonLabel>
		</BillingIntervalSwitcherContainer>
	);
};

export default BillingIntervalSwitcher;
