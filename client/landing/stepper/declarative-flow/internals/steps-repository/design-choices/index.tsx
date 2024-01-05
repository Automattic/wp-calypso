import {
	DEFAULT_ASSEMBLER_DESIGN,
	themeGalleryIllustrationImage,
	patternAssemblerIllustrationImage,
} from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import kebabCase from '../../../../utils/kebabCase';
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
	const subHeaderText = translate( 'You can change your mind later.' );
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const handleSubmit = ( destination: string ) => {
		recordTracksEvent( 'calypso_signup_design_choices_submit', {
			flow,
			step: stepName,
			intent,
			destination: kebabCase( destination ),
		} );

		if ( destination === 'pattern-assembler' ) {
			setSelectedDesign( DEFAULT_ASSEMBLER_DESIGN );
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
				formattedHeader={
					<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
				}
				stepContent={
					<div className="design-choices__container">
						<DesignChoice
							title={ translate( 'Choose a theme' ) }
							description={ translate( 'Choose one of our professionally designed themes.' ) }
							imageSrc={ themeGalleryIllustrationImage }
							destination="designSetup"
							onSelect={ handleSubmit }
						/>
						<DesignChoice
							className="design-choices__design-your-own"
							title={ translate( 'Design your own' ) }
							description={ translate( 'Design your own homepage with custom styles and pages.' ) }
							imageSrc={ patternAssemblerIllustrationImage }
							destination="pattern-assembler"
							onSelect={ handleSubmit }
						/>
					</div>
				}
				goBack={ goBack }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default DesignChoicesStep;
