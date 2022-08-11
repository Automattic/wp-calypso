import { StepContainer } from '@automattic/onboarding';
import { PatternPicker } from '@automattic/pattern-picker';
import { useI18n } from '@wordpress/react-i18n';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation } ) {
	const { goNext, goBack } = navigation;
	const { __ } = useI18n();

	return (
		<StepContainer
			stepName={ 'patterns' }
			goBack={ goBack }
			goNext={ goNext }
			shouldHideNavButtons
			isFullLayout={ true }
			stepContent={ <PatternPicker /> }
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					id={ 'seller-step-header' }
					headerText={ __( 'Choose a design to start' ) }
					align={ 'center' }
				/>
			}
			showJetpackPowered
		/>
	);
};

export default Intro;
