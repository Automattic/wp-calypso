import { SubTitle } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { noop } from 'lodash';
import { useSelector } from 'react-redux';
import AccordionFormSection from 'calypso/signup/accordion-form/accordion-form-section';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { SiteData } from 'calypso/state/ui/selectors/get-selected-site';
import { HorizontalGrid, Paragraph } from './components';
import { WordpressMediaUpload } from './wordpress-media-upload';

function WebsiteContent() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );

	return (
		<AccordionFormSection
			key={ 1 }
			title={ translate( '%d. Homepage', {
				args: [ 1 ],
				comment: 'This is the serial number: 1',
			} ) }
			isExpanded={ true }
			showSkip={ true }
			isTouched={ true }
			onNext={ noop }
			onOpen={ noop }
		>
			<SubTitle tagName="h4">{ translate( 'Media' ) }</SubTitle>
			<Paragraph>{ translate( 'Upload up to 3 images to be used on your Home page' ) }</Paragraph>
			<HorizontalGrid>
				<WordpressMediaUpload mediaId={ 1 } site={ site as SiteData } onMediaUploaded={ noop } />
				<WordpressMediaUpload mediaId={ 2 } site={ site as SiteData } onMediaUploaded={ noop } />
				<WordpressMediaUpload mediaId={ 3 } site={ site as SiteData } onMediaUploaded={ noop } />
			</HorizontalGrid>
		</AccordionFormSection>
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
