import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import TransferDomains from './domains';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, flow } ) {
	const { submit, goBack } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		submit?.();
	};
	return (
		<StepContainer
			flowName={ flow }
			stepName="domains"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-transfer-header"
					headerText={ __( 'Add your unlocked domains' ) }
					subHeaderText={ __(
						'Next, add your domain name and authorization code below, you can transfer as many domains as you like.'
					) }
					align="center"
				/>
			}
			stepContent={
				<CalypsoShoppingCartProvider>
					<TransferDomains onSubmit={ handleSubmit } />
				</CalypsoShoppingCartProvider>
			}
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showVideoPressPowered={ false }
			showJetpackPowered={ true }
		/>
	);
};

export default Intro;
