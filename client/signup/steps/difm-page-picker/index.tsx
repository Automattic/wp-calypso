import StepWrapper from 'calypso/signup/step-wrapper';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';

export default function DIFMPagePicker( props: any ) {
	const translate = useTranslate();

	const headerText = translate( 'Add pages to your website' );
	const subHeaderText = translate(
		'Curabitur elementum lectus mi, quis venenatis metus tincidunt ac. Integer non lorem erat. Sed suscipit dapibus nulla id placerat. You can add up to 5 pages. For each extra page you will be charged $5.'
	);

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <FormattedHeader brandFont headerText={ headerText } align="left" /> }
			hideSkip
			{ ...props }
		/>
	);
}
