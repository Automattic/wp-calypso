import { RenderedContent } from '@automattic/block-renderer';
import { FormLabel } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import {
	__experimentalNavigatorProvider as NavigatorProvider,
	Button,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import React, { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useInitialPath } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/hooks';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { renderReadymadeTemplate } from 'calypso/my-sites/patterns/hooks/use-render-readymade-template';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';
import generateAIContentForTemplate from './api/generate-content';
import ReadymadeTemplatePreview from './components/readymade-template-preview';
import TextProgressBar from './components/text-progress-bar';
import './style.scss';
import type { OnboardSelect } from '@automattic/data-stores';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';

const ReadymadeTemplateGenerateContent = ( {
	selectedReadymadeTemplate,
}: {
	selectedReadymadeTemplate: ReadymadeTemplate;
} ) => {
	const taglineLabel = 'Describe your site';
	const [ aiContext, setAiContext ] = useState( 'No context provided' );
	const [ readymadeTemplate, setReadymadeTemplate ] = useState( selectedReadymadeTemplate );
	const [ renderedContent, setRenderedContent ] = useState< RenderedContent | null >( null );
	const [ numberOfGenerations, setNumberOfGenerations ] = useState( 0 );
	const [ isLoading, setIsLoading ] = useState( true );

	const handleTextareaChange = ( event: { target: { value: string } } ) => {
		setAiContext( event.target.value );
	};

	const generateContent = () => {
		setIsLoading( true );
		setNumberOfGenerations( numberOfGenerations + 1 );
		generateAIContentForTemplate( readymadeTemplate, aiContext ).then( setReadymadeTemplate );
	};

	useEffect( () => {
		if ( ! readymadeTemplate ) {
			return;
		}

		renderReadymadeTemplate( readymadeTemplate ).then( setRenderedContent );
		setIsLoading( false );
	}, [ readymadeTemplate ] );

	return (
		<>
			<div className="generate-content">
				<DocumentHead title="This is the header text" />
				<form className="generate-content__form">
					<FormFieldset className="generate-content__form-fieldset">
						<FormLabel htmlFor="tagline">{ taglineLabel }</FormLabel>
						<p className="generate-content__description">
							Describe your site in a few sentences. The more details you give us the better results
							you'll get.
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
							Generate content
						</Button>
						<Button
							className="checklist-item__checklist-primary-button"
							disabled={ numberOfGenerations < 1 }
						>
							Continue with this content
						</Button>
					</div>
				</form>
			</div>
			<ReadymadeTemplatePreview renderedContent={ renderedContent } isLoading={ isLoading } />
		</>
	);
};

const ReadymadeTemplateGenerateContentStep: Step = function ReadymadeTemplateGenerateContentStep( {
	navigation,
} ) {
	const readymadeTemplateId = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedReadymadeTemplateId(),
		[]
	);
	console.log( 'Stored rt', readymadeTemplateId );
	const { data: readymadeTemplates = [] } = useReadymadeTemplates();
	const readymadeTemplate = readymadeTemplates.find(
		( rt ) => rt.template_id === readymadeTemplateId
	);

	if ( ! readymadeTemplate ) {
		return;
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
			stepContent={
				<ReadymadeTemplateGenerateContent selectedReadymadeTemplate={ readymadeTemplate } />
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ReadymadeTemplateGenerateContentStep;
