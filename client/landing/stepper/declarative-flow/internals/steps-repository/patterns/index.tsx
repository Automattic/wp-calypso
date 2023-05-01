import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { Design } from '@automattic/design-picker';

import './styles.scss';

const Patterns: Step = function Patterns( { navigation } ) {
	const { goNext, goBack, submit } = navigation;
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );
	const { __ } = useI18n();

	function handleSubmit( design: Design ) {
		setSelectedDesign( design );
		submit?.();
	}

	return (
		<StepContainer
			stepName="patterns"
			goBack={ goBack }
			goNext={ goNext }
			shouldHideNavButtons
			isFullLayout={ true }
			stepContent={
				<AsyncLoad
					require="@automattic/pattern-picker"
					placeholder={ null }
					onPick={ handleSubmit }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					id="seller-step-header"
					headerText={ __( 'Choose a design to start' ) }
					align="center"
				/>
			}
		/>
	);
};

export default Patterns;
