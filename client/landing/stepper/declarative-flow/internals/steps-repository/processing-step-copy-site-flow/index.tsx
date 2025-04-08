import { useTranslate } from 'i18n-calypso';
import ProcessingStep from '../processing-step';

const ProcessingStepCopySiteFlow: typeof ProcessingStep = ( props ) => {
	const translate = useTranslate();
	return (
		<ProcessingStep
			{ ...props }
			title={ translate( 'We’re copying your site' ) }
			subtitle={ translate(
				'Feel free to close this window. We’ll email you when your new site is ready.'
			) }
		/>
	);
};

export default ProcessingStepCopySiteFlow;
