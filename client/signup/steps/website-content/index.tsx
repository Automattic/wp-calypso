import { useTranslate } from 'i18n-calypso';
import StepWrapper from 'calypso/signup/step-wrapper';

function WebsiteContent() {
	return (
		<div
			style={ {
				width: '500px',
				backgroundColor: '#eee',
				height: '300px',
				padding: '30px',
			} }
		>
			Coming Soon ...
		</div>
	);
}

export default function WrapperWebsiteContent( props: {
	flowName: string;
	stepName: string;
	positionInFlow: string;
} ) {
	const { flowName, stepName, positionInFlow } = props;
	const translate = useTranslate();

	const headerText = translate( 'Website Content' );
	const subHeaderText = translate(
		'In this step, you will add your brand visuals, pages and media to be used on your website.'
	);

	return (
		<StepWrapper
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackHeaderText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			stepContent={ <WebsiteContent /> }
			goToNextStep={ false }
			hideFormattedHeader={ false }
			hideBack={ false }
			align={ 'left' }
			isHorizontalLayout={ true }
			isWideLayout={ true }
		/>
	);
}
