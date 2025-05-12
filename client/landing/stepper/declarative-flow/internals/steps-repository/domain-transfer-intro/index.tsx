import { MaterialIcon } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { StepContainer, GOOGLE_TRANSFER } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import ChatButton from 'calypso/components/chat-button';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep from './intro';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, variantSlug } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const hasEnTranslation = useHasEnTranslation();

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
							? __( 'Transfer your Squarespace domains' )
							: __( 'Transfer Your Domains' )
					}
					subHeaderText={
						isGoogleDomainsTransferFlow
							? __(
									'Follow these three simple steps to transfer your Squarespace domains to WordPress.com.'
							  )
							: __( 'Follow these three simple steps to transfer your domains to WordPress.com.' )
					}
				/>
			}
			stepContent={ <IntroStep onSubmit={ handleSubmit } variantSlug={ variantSlug } /> }
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
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
