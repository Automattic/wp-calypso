import { MaterialIcon } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { GOOGLE_TRANSFER, HUNDRED_YEAR_DOMAIN_TRANSFER } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import ChatButton from 'calypso/components/chat-button';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import { WIDE_BREAKPOINT } from '../hundred-year-plan-step-wrapper/constants';
import TransferDomains from './domains';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, flow, variantSlug } ) {
	const { submit, goBack } = navigation;
	const { __ } = useI18n();
	const hasEnTranslation = useHasEnTranslation();

	const handleSubmit = () => {
		submit?.();
	};

	const isGoogleDomainsTransferFlow = GOOGLE_TRANSFER === variantSlug;
	const isHundredYearDomainsTransferFlow = HUNDRED_YEAR_DOMAIN_TRANSFER === variantSlug;

	const Container = isHundredYearDomainsTransferFlow ? HundredYearPlanStepWrapper : StepContainer;

	const headerText = isHundredYearDomainsTransferFlow
		? __( 'Transfer your Domain' )
		: __( 'Add your domains' );

	const regularFlowsSubheaderText = isGoogleDomainsTransferFlow
		? __( 'Enter your domain names and transfer codes below.' )
		: __( 'Enter your domain names and authorization codes below.' );

	const hundredYearFlowsSubheaderText = __(
		'Start building your legacy. Secure your domain for the next 100 years.'
	);

	const subHeaderText = isHundredYearDomainsTransferFlow
		? hundredYearFlowsSubheaderText
		: regularFlowsSubheaderText;

	return (
		<Container
			flowName={ flow }
			variantSlug={ variantSlug }
			mobileBreakpoint={ WIDE_BREAKPOINT }
			stepName="domains"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-transfer-header"
					headerText={ headerText }
					subHeaderText={
						<>
							<span>{ subHeaderText }</span>
						</>
					}
					align="center"
				/>
			}
			stepContent={
				<CalypsoShoppingCartProvider>
					<TransferDomains onSubmit={ handleSubmit } variantSlug={ variantSlug } />
				</CalypsoShoppingCartProvider>
			}
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showJetpackPowered={ false }
			customizedActionButtons={
				<ChatButton
					chatIntent="SUPPORT"
					initialMessage="User is contacting us from the domains-transfer flow"
					className="domains-transfer-chat-button"
					withHelpCenter={ false }
					section="domains-transfer"
				>
					<MaterialIcon icon="chat_bubble" />
					{ hasEnTranslation( 'Need help? Contact us' )
						? __( 'Need help? Contact us' )
						: __( 'Need help? Chat with us' ) }
				</ChatButton>
			}
		/>
	);
};

export default Intro;
