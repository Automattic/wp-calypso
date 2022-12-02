import { Design } from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const DesignCarousel: Step = function DesignCarousel( { navigation } ) {
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();

	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	function pickDesign( _selectedDesign: Design ) {
		setSelectedDesign( _selectedDesign );
		submit?.();
	}

	return (
		<StepContainer
			stepName="designCarousel"
			goBack={ goBack }
			goNext={ goNext }
			shouldHideNavButtons
			isFullLayout={ true }
			stepContent={
				<AsyncLoad
					require="@automattic/design-carousel"
					placeholder={ null }
					onPick={ pickDesign }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					id="seller-step-header"
					headerText={ __( 'Choose a design to start' ) }
					subHeaderText={ __(
						"Don't worry, you can change or customize this at any time in the future."
					) }
					align="center"
				/>
			}
		/>
	);
};

export default DesignCarousel;
