import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import ChatButton from 'calypso/components/chat-button';
import FormattedHeader from 'calypso/components/formatted-header';
import MaterialIcon from 'calypso/components/material-icon';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import TransferDomains from './domains';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, flow, variantSlug } ) {
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
					headerText={ __( 'Add your domains' ) }
					subHeaderText={
						<>
							<span>{ __( 'Enter your domain names and authorization codes below.' ) }</span>
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
			showVideoPressPowered={ false }
			showJetpackPowered={ false }
			customizedActionButtons={
				<ChatButton
					chatIntent="SUPPORT"
					initialMessage="User is contacting us from the domains-transfer flow"
					className="domains-transfer-chat-button"
					withHelpCenter={ false }
				>
					<MaterialIcon icon="chat_bubble" />
					{ __( 'Need help? Chat with us' ) }
				</ChatButton>
			}
		/>
	);
};

export default Intro;
