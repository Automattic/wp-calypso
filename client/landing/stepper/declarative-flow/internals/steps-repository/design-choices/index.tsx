import {
	getAssemblerDesign,
	themesIllustrationImage,
	assemblerIllustrationV2Image,
} from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useIsSiteAssemblerEnabled } from 'calypso/data/site-assembler';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { ONBOARD_STORE } from '../../../../stores';
import kebabCase from '../../../../utils/kebabCase';
import hiBigSky from './big-sky-no-text-small.png';
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
	const documentHeaderText = translate( 'Bring your vision to life' );
	const headerText = translate(
		'Time to build your site!{{br/}}How would you like to get started?',
		{
			components: {
				br: <br />,
			},
		}
	);
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const { isEligible, isLoading } = useIsBigSkyEligible();

	const isSiteAssemblerEnabled = useIsSiteAssemblerEnabled();

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
			<DocumentHead title={ documentHeaderText } />
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
									description={ translate(
										'Start from scratch, designing your site with patterns, pages, and styles.'
									) }
									imageSrc={ assemblerIllustrationV2Image }
									destination="pattern-assembler"
									onSelect={ handleSubmit }
								/>
							) }
							{ ! isLoading && isEligible && (
								<DesignChoice
									className="design-choices__try-big-sky"
									title={ translate( 'Create your site with AI' ) }
									description={ translate(
										'Tell our AI what you need, and watch it come to life.'
									) }
									imageSrc={ hiBigSky }
									destination="launch-big-sky"
									onSelect={ () => {
										recordTracksEvent( 'calypso_big_sky_choose', {
											flow,
											step: stepName,
										} );
										const queryParams = new URLSearchParams( location.search ).toString();
										navigate(
											`/setup/site-setup/launch-big-sky${ queryParams ? `?${ queryParams }` : '' }`
										);
									} }
								/>
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
