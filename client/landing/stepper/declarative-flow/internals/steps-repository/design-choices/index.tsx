import {
	getAssemblerDesign,
	themesIllustrationImage,
	assemblerIllustrationImage,
	hiBigSky,
} from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useIsSiteAssemblerEnabledExp } from 'calypso/data/site-assembler';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { ONBOARD_STORE } from '../../../../stores';
import kebabCase from '../../../../utils/kebabCase';
import BigSkyDisclaimerModal from '../../components/big-sky-disclaimer-modal';
import DesignChoice from './design-choice';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

/**
 * The design choices step
 */
const DesignChoicesStep: Step = ( { navigation, flow, stepName } ) => {
	const translate = useTranslate();
	const { submit, goBack } = navigation;
	const headerText = translate( 'Bring your vision to life' );
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const { isEligible, isLoading } = useIsBigSkyEligible();

	const isSiteAssemblerEnabled = useIsSiteAssemblerEnabledExp( 'design-choices' );

	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		if ( ! isLoading && isEligible ) {
			recordTracksEvent( 'calypso_big_sky_view_choice', {
				flow,
				step: stepName,
			} );
		}
	}, [ isEligible, isLoading, flow, stepName ] );

	const handleSubmit = ( destination: string ) => {
		recordTracksEvent( 'calypso_signup_design_choices_submit', {
			flow,
			step: stepName,
			intent,
			destination: kebabCase( destination ),
		} );

		if ( destination === 'pattern-assembler' || destination === 'launch-big-sky' ) {
			setSelectedDesign( getAssemblerDesign() );
		}

		if ( destination === 'launch-big-sky' ) {
			return;
		}

		submit?.( { destination } );
	};

	return (
		<>
			<DocumentHead title={ headerText } />
			<StepContainer
				flowName={ flow }
				stepName={ stepName }
				isHorizontalLayout={ false }
				formattedHeader={ <FormattedHeader headerText={ headerText } /> }
				stepContent={
					<>
						<div className="design-choices__body">
							<DesignChoice
								title={ translate( 'Choose a theme' ) }
								description={ translate( 'Choose one of our professionally designed themes.' ) }
								imageSrc={ themesIllustrationImage }
								destination="designSetup"
								onSelect={ handleSubmit }
							/>
							{ isSiteAssemblerEnabled && (
								<DesignChoice
									className="design-choices__design-your-own"
									title={ translate( 'Design your own' ) }
									description={ translate( 'Design your site with patterns, pages, styles.' ) }
									imageSrc={ assemblerIllustrationImage }
									destination="pattern-assembler"
									onSelect={ handleSubmit }
								/>
							) }
							{ ! isLoading && isEligible && (
								<BigSkyDisclaimerModal flow={ flow } stepName={ stepName }>
									<DesignChoice
										className="design-choices__try-big-sky"
										title={ translate( 'Try Big Sky' ) }
										description={ translate( 'The AI website builder for WordPress.' ) }
										imageSrc={ hiBigSky }
										destination="launch-big-sky"
										onSelect={ handleSubmit }
									/>
								</BigSkyDisclaimerModal>
							) }
						</div>
					</>
				}
				goBack={ goBack }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default DesignChoicesStep;
