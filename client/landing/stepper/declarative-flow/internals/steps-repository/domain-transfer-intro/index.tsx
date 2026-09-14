import { MaterialIcon } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import ChatButton from 'calypso/components/chat-button';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep from './intro';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		submit?.();
	};

	return (
		<StepContainer
			hideBack
			stepName="intro"
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-transfer-header"
					headerText={ __( 'Transfer Your Domains' ) }
					subHeaderText={ __(
						'Follow these three simple steps to transfer your domains to WordPress.com.'
					) }
				/>
			}
			stepContent={ <IntroStep onSubmit={ handleSubmit } /> }
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
					{ __( 'Need help?' ) }
				</ChatButton>
			}
		/>
	);
};

export default Intro;
