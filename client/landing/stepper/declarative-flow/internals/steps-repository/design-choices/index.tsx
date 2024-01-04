import { DEFAULT_ASSEMBLER_DESIGN } from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

/**
 * The design choices step
 */
const DesignChoicesStep: Step = ( { navigation, flow, stepName } ) => {
	const translate = useTranslate();
	const { submit, goBack } = navigation;
	const headerText = translate( 'How would you like to start?' );
	const subHeaderText = translate( 'You can change your mind later.' );
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const handleSubmit = () => {
		recordTracksEvent( 'calypso_signup_design_choices_submit', {
			flow,
			step: stepName,
			intent,
			destination: '',
		} );

		submit?.( { selectedDesign: DEFAULT_ASSEMBLER_DESIGN } );
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
				stepContent={ <div>Hello</div> }
				goBack={ goBack }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default DesignChoicesStep;
