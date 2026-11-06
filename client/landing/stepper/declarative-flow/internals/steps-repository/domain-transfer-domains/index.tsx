import { Step, HUNDRED_YEAR_DOMAIN_TRANSFER } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import FormattedHeader from 'calypso/components/formatted-header';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import DomainTransferHelpButton from '../domain-transfer-help-button';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import { WIDE_BREAKPOINT } from '../hundred-year-plan-step-wrapper/constants';
import TransferDomains from './domains';
import type { Step as StepType } from '../../types';

import './styles.scss';

const Domains: StepType = function Domains( { navigation, flow, variantSlug } ) {
	const { submit, goBack } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		submit?.();
	};

	const stepContent = (
		<CalypsoShoppingCartProvider>
			<TransferDomains onSubmit={ handleSubmit } variantSlug={ variantSlug } />
		</CalypsoShoppingCartProvider>
	);

	if ( HUNDRED_YEAR_DOMAIN_TRANSFER === variantSlug ) {
		return (
			<HundredYearPlanStepWrapper
				flowName={ flow }
				variantSlug={ variantSlug }
				mobileBreakpoint={ WIDE_BREAKPOINT }
				stepName="domains"
				formattedHeader={
					<FormattedHeader
						id="domain-transfer-header"
						headerText={ __( 'Transfer your Domain' ) }
						subHeaderText={
							<>
								<span>
									{ __( 'Start building your legacy. Secure your domain for the next 100 years.' ) }
								</span>
							</>
						}
						align="center"
					/>
				}
				stepContent={ stepContent }
			/>
		);
	}

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 8 }
			topBar={
				<Step.TopBar
					leftElement={ goBack ? <Step.BackButton onClick={ goBack } /> : null }
					rightElement={ <DomainTransferHelpButton /> }
				/>
			}
			heading={
				<Step.Heading
					text={ __( 'Add your domains' ) }
					subText={ __( 'Enter your domain names and authorization codes below.' ) }
				/>
			}
		>
			{ stepContent }
		</Step.CenteredColumnLayout>
	);
};

export default Domains;
