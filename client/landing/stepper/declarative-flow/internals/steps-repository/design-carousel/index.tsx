import { type StarterDesigns, useStarterDesignsQuery } from '@automattic/data-stores';
import { Design } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const getFlowDesigns = ( allDesigns: StarterDesigns | undefined ) => {
	if ( ! allDesigns ) {
		return null;
	}

	return allDesigns?.designs;
};

const DesignCarousel: Step = function DesignCarousel( { navigation } ) {
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const locale = useLocale();
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );
	const { data: allDesigns } = useStarterDesignsQuery( {
		_locale: locale,
	} );

	function pickDesign( _selectedDesign: Design ) {
		setSelectedDesign( _selectedDesign );
		submit?.( { theme: _selectedDesign?.slug, theme_type: _selectedDesign?.design_type } );
	}

	return (
		<StepContainer
			stepName="designCarousel"
			goBack={ goBack }
			goNext={ goNext }
			shouldHideNavButtons
			isFullLayout
			stepContent={
				<AsyncLoad
					require="@automattic/design-carousel"
					placeholder={ null }
					onPick={ pickDesign }
					selectedDesigns={ getFlowDesigns( allDesigns ) }
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

export default DesignCarousel;
