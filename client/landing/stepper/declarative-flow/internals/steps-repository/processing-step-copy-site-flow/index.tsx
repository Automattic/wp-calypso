import { useTranslate } from 'i18n-calypso';
import { StepProps } from '../../types';
import ProcessingStep from '../processing-step';

export default function ProcessingStepCopySiteFlow( props: StepProps ) {
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
}
