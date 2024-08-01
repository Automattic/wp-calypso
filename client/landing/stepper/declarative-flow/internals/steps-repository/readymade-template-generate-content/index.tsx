import { FormLabel } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import React, { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';
import generateAIContentForTemplate from './api/generate-content';
import ReadymadeTemplatePreview from './components/readymade-template-preview';
import TextProgressBar from './components/text-progress-bar';
import type { OnboardSelect, SiteDetails } from '@automattic/data-stores';
import './style.scss';

type ReadymadeTemplateGenerateContentProps = {
	readymadeTemplate: ReadymadeTemplate;
};

const ReadymadeTemplateGenerateContent: React.FC< ReadymadeTemplateGenerateContentProps > = ( {
	readymadeTemplate,
} ) => {
	const defaultContext = translate( 'Write an amazing description of your site.' );
	const [ aiContext, setAiContext ] = useState( defaultContext );
	const [ numberOfGenerations, setNumberOfGenerations ] = useState( 0 );
	const [ isGeneratingContent, setIsGeneratingContent ] = useState( false );
	const { ID: siteId, URL: url } = useSite() as SiteDetails;
	const { assembleSite } = useDispatch( SITE_STORE );
	const siteSlug = url ? url.split( '/' ).pop() : '';

	const handleTextareaChange = ( event: { target: { value: string } } ) => {
		setAiContext( event.target.value );
	};

	const generateContent = () => {
		setIsGeneratingContent( true );
		setNumberOfGenerations( numberOfGenerations + 1 );
		generateAIContentForTemplate( readymadeTemplate, aiContext )
			.then( ( rt: ReadymadeTemplate ) =>
				assembleSite( siteId, 'assembler', {
					homeHtml: rt.home.content,
					headerHtml: rt.home.header,
					footerHtml: rt.home.footer,
					pages: [],
					globalStyles: rt.globalStyles,
					canReplaceContent: true,
					siteSetupOption: 'readymade-template',
				} )
			)
			.then( () => setIsGeneratingContent( false ) );
	};

	return (
		<>
			<div className="generate-content">
				<DocumentHead title="This is the header text" />
				<form className="generate-content__form">
					<FormFieldset className="generate-content__form-fieldset">
						<FormLabel htmlFor="tagline">{ translate( 'Describe your site' ) }</FormLabel>
						<p className="generate-content__description">
							{ translate(
								`Describe your site in a few sentences. The more details you give us the better results you'll get.`
							) }
						</p>
						<FormTextarea
							name="tagline"
							id="tagline"
							value={ aiContext }
							onChange={ handleTextareaChange }
						/>
						<TextProgressBar target={ 256 } text={ aiContext } />
					</FormFieldset>
					<div className="generate-content__buttons">
						<Button
							className="checklist-item__checklist-primary-button"
							onClick={ generateContent }
							disabled={ numberOfGenerations >= 5 }
						>
							{ translate( 'Generate content' ) }
						</Button>
					</div>
				</form>
			</div>
			<ReadymadeTemplatePreview isLoading={ isGeneratingContent } siteSlug={ siteSlug } />
		</>
	);
};

const ReadymadeTemplateGenerateContentStep: Step = function ReadymadeTemplateGenerateContentStep( {
	navigation,
} ) {
	const readymadeTemplate = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedReadymadeTemplate(),
		[]
	);

	let content = <></>;
	if ( readymadeTemplate ) {
		content = <ReadymadeTemplateGenerateContent readymadeTemplate={ readymadeTemplate } />;
	}

	return (
		<StepContainer
			stepName="generate-content"
			isFullLayout
			goBack={ navigation.goBack }
			hideBack={ false }
			flowName="readymade-template-generate-content"
			formattedHeader={
				<FormattedHeader
					id="free-setup-header"
					headerText="Customize Content With AI"
					align="center"
				/>
			}
			stepContent={ content }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ReadymadeTemplateGenerateContentStep;
