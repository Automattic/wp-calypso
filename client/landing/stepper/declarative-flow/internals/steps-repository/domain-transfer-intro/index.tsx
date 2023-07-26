import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import IntroStep from './intro';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	usePresalesChat( 'wpcom' );

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
					headerText={ __( 'Transfer your domains' ) }
					subHeaderText={ __(
						'Follow these three simple steps to transfer your domains to WordPress.com.'
					) }
				/>
			}
			stepContent={ <IntroStep onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showVideoPressPowered={ false }
			showJetpackPowered={ false }
		/>
	);
};

export default Intro;
