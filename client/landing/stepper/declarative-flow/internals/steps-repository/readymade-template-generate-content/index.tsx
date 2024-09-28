import { FormLabel } from '@automattic/components';
import { OnboardSelect, updateLaunchpadSettings } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React, { useState } from 'react';
import useUrlQueryParam from 'calypso/a8c-for-agencies/hooks/use-url-query-param';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';
import generateAIContentForTemplate from './api/generate-content';
import ReadymadeTemplatePreview from './components/readymade-template-preview';
import TextProgressBar from './components/text-progress-bar';
import './style.scss';

type ReadymadeTemplateGenerateContentProps = {
	selectedReadymadeTemplate: ReadymadeTemplate;
	siteId: number;
	siteSlug: string;
	next?: () => void;
};

const ReadymadeTemplateGenerateContent: React.FC< ReadymadeTemplateGenerateContentProps > = ( {
	selectedReadymadeTemplate,
	siteId,
	siteSlug,
	next = () => {},
} ) => {
	const [ aiContext, setAiContext ] = useState( '' );
	const [ numberOfGenerations, setNumberOfGenerations ] = useState( 0 );
	const [ isGeneratingContent, setIsGeneratingContent ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ aiGeneratedRT, setAiGeneratedRT ] = useState( selectedReadymadeTemplate );
	const { assembleSite } = useDispatch( SITE_STORE );
	const { setSelectedReadymadeTemplate } = useDispatch( ONBOARD_STORE );
	const locale = useLocale();

	const markContentGenerationTaskComplete = () =>
		updateLaunchpadSettings( siteSlug, {
			checklist_statuses: { generate_content: true },
		} );

	const isPromptEmpty = ! aiContext.trim();

	const handleTextareaChange = ( event: { target: { value: string } } ) => {
		setAiContext( event.target.value );
	};

	const updateSiteContents = ( rt: ReadymadeTemplate ) =>
		assembleSite( siteId, 'pub/assembler', {
			homeHtml: rt.home.content,
			headerHtml: rt.home.header,
			footerHtml: rt.home.footer,
			pages: [],
			globalStyles: rt.globalStyles,
			canReplaceContent: true,
			siteSetupOption: 'readymade-template',
		} );

	const restoreSiteContents = () => updateSiteContents( selectedReadymadeTemplate );

	const applyContent = () => {
		setIsSaving( true );
		setSelectedReadymadeTemplate( aiGeneratedRT );
		updateSiteContents( aiGeneratedRT ).then( markContentGenerationTaskComplete ).then( next );
	};

	const generateContent = () => {
		setIsGeneratingContent( true );
		generateAIContentForTemplate( selectedReadymadeTemplate, aiContext, locale )
			.then( ( aiGeneratedRt: ReadymadeTemplate ) => {
				setAiGeneratedRT( aiGeneratedRt );
				return updateSiteContents( aiGeneratedRt );
			} )
			.then( () => {
				setIsGeneratingContent( false );
				restoreSiteContents();
				setNumberOfGenerations( numberOfGenerations + 1 );
			} );
	};

	const primaryButtonClasses = clsx( 'checklist-item__checklist-primary-button', {
		hidden: numberOfGenerations === 0,
	} );

	return (
		<>
			<div className="generate-content">
				<DocumentHead title={ translate( 'Customize Content With AI' ) } />
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
							disabled={ isGeneratingContent || isSaving }
							placeholder={ translate(
								"Write an amazing description of your site, like: The Beachcomber Bistro is a cafe offering amazing food, delicious coffee and local beers. It's located next to the beach at Harlyn Bay, offering a stunning view from our deck."
							) }
							onChange={ handleTextareaChange }
						/>
						<TextProgressBar target={ 256 } text={ aiContext } />
					</FormFieldset>
					<div className="generate-content__buttons">
						<Button
							className="checklist-item__checklist-secondary-button"
							onClick={ generateContent }
							disabled={
								isPromptEmpty || numberOfGenerations >= 5 || isGeneratingContent || isSaving
							}
						>
							{ isGeneratingContent
								? translate( 'Generating content' )
								: translate( 'Generate content' ) }
						</Button>
						<Button
							className={ primaryButtonClasses }
							onClick={ applyContent }
							disabled={ isSaving || numberOfGenerations === 0 || isGeneratingContent }
						>
							{ isSaving ? translate( 'Saving, please wait' ) : translate( 'Continue' ) }
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
	const { readymadeTemplate, siteId } = useSelect( ( select ) => {
		const store = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			readymadeTemplate: store.getSelectedReadymadeTemplate(),
			siteId: store.getSelectedSite(),
		};
	}, [] );
	const { value: siteSlug } = useUrlQueryParam( 'siteSlug' );

	let content = <></>;
	if ( readymadeTemplate && siteId && siteSlug ) {
		content = (
			<ReadymadeTemplateGenerateContent
				selectedReadymadeTemplate={ readymadeTemplate }
				siteId={ siteId }
				siteSlug={ siteSlug }
				next={ navigation.goBack }
			/>
		);
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
