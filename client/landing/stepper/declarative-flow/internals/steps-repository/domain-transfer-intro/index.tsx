import { GOOGLE_TRANSFER } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import ChatButton from 'calypso/components/chat-button';
import FormattedHeader from 'calypso/components/formatted-header';
import MaterialIcon from 'calypso/components/material-icon';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep from './intro';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, variantSlug } ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		submit?.();
	};

	const isGoogleDomainsTransferFlow = GOOGLE_TRANSFER === variantSlug;

	return (
		<StepContainer
			hideBack
			stepName="intro"
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-transfer-header"
					headerText={
						isGoogleDomainsTransferFlow
							? __( 'Transfer your Google domains' )
							: __( 'Transfer Your Domains' )
					}
					subHeaderText={
						isGoogleDomainsTransferFlow
							? __(
									'Follow these three simple steps to transfer your Google domains to WordPress.com.'
							  )
							: __( 'Follow these three simple steps to transfer your domains to WordPress.com.' )
					}
				/>
			}
			stepContent={ <IntroStep onSubmit={ handleSubmit } variantSlug={ variantSlug } /> }
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
