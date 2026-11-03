import { MaterialIcon } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import ChatButton from 'calypso/components/chat-button';
import { getSafeUrl } from 'calypso/lib/site-launch/destination';
import { useQuery } from '../../../../hooks/use-query';
import IntroStep from './intro';
import type { Step as StepType } from '../../types';

import './styles.scss';

const Intro: StepType = function Intro( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const backTo = getSafeUrl( useQuery().get( 'back_to' ) );

	const handleSubmit = () => {
		submit?.();
	};

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 6 }
			className="step-container-v2--domain-transfer-intro"
			topBar={
				<Step.TopBar
					leftElement={ backTo ? <Step.BackButton href={ backTo } /> : null }
					rightElement={
						<ChatButton
							chatIntent="SUPPORT"
							initialMessage="User is contacting us from the domains-transfer flow"
							className="domains-transfer-chat-button"
							withHelpCenter={ false }
							section="domains-transfer"
						>
							<MaterialIcon icon="chat_bubble" />
							{ isMobileViewport ? __( 'Help' ) : __( 'Need help?' ) }
						</ChatButton>
					}
				/>
			}
			heading={
				<Step.Heading
					text={ __( 'Transfer Your Domains' ) }
					subText={ __(
						'Follow these three simple steps to transfer your domains to WordPress.com.'
					) }
				/>
			}
		>
			<IntroStep onSubmit={ handleSubmit } />
		</Step.CenteredColumnLayout>
	);
};

export default Intro;
