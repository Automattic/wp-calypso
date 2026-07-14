import { isAutomatticianQuery } from '@automattic/api-queries';
import { BigSkyLogo, SummaryButton } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Icon,
	TextareaControl,
} from '@wordpress/components';
import { arrowUp, layout, brush } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { FormEvent, useState } from 'react';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useQuery } from '../../../../hooks/use-query';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step as StepType } from '../../types';
import './style.scss';

const SetupYourSiteAIStep: StepType = ( { navigation } ) => {
	const { siteSlug, siteId } = useSiteData();
	const translate = useTranslate();
	const ref = useQuery().get( 'ref' );
	const showPromptInput = ref === WOO_HOSTING_SOLUTIONS_REF;
	const [ prompt, setPrompt ] = useState( '' );
	// Automattician-only "Generate Theme" entry point that provisions a WP Cloud
	// site up front and runs the build-wow AI theme generation flow.
	const { data: isAutomattician } = useReactQuery( isAutomatticianQuery() );

	const submitBuildWithAI = ( trimmedPrompt?: string ) => {
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'build-with-ai',
			has_prompt: Boolean( trimmedPrompt ),
		} );

		navigation.submit( {
			setupChoice: 'build-with-ai',
			siteSlug,
			siteId,
			prompt: trimmedPrompt || undefined,
		} );
	};

	const handleBuildWithAIClick = () => {
		submitBuildWithAI();
	};

	const handleBuildWithAISubmit = ( event: FormEvent ) => {
		event.preventDefault();
		submitBuildWithAI( prompt.trim() );
	};

	const handleBlankSite = () => {
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'blank-site',
		} );

		navigation.submit( {
			setupChoice: 'blank-site',
			siteSlug,
		} );
	};

	const handleGenerateTheme = () => {
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'generate-theme',
		} );

		navigation.submit( {
			setupChoice: 'generate-theme',
			siteSlug,
			siteId,
		} );
	};

	const buildWithAIPromptCard = (
		<form className="setup-your-site-ai-step__build-with-ai" onSubmit={ handleBuildWithAISubmit }>
			<HStack
				alignment="left"
				spacing={ 2 }
				className="setup-your-site-ai-step__build-with-ai-header"
			>
				<span className="setup-your-site-ai-step__build-with-ai-decoration">
					<BigSkyLogo.CentralLogo heartless />
				</span>
				<span className="setup-your-site-ai-step__build-with-ai-title">
					{ translate( 'Build with AI' ) }
				</span>
			</HStack>
			<div className="setup-your-site-ai-step__prompt-area">
				<p className="setup-your-site-ai-step__prompt-description">
					{ translate(
						'Describe what you want to sell or offer, and the kind of store you want to create. We’ll use this to design your store — whether you take bookings, sell products, or both.'
					) }
				</p>
				<div className="setup-your-site-ai-step__prompt-input">
					<TextareaControl
						label={ translate( 'Describe your store' ) }
						hideLabelFromVision
						placeholder={ translate( 'Take bookings for a hair salon…' ) }
						value={ prompt }
						onChange={ setPrompt }
						rows={ 3 }
					/>
					<Button
						type="submit"
						variant="primary"
						className="setup-your-site-ai-step__prompt-submit"
						label={ translate( 'Build with AI' ) }
						icon={ arrowUp }
						disabled={ ! prompt.trim() }
						accessibleWhenDisabled
					/>
				</div>
			</div>
		</form>
	);

	const buildWithAISummary = (
		<SummaryButton
			title={ translate( 'Build with AI' ) }
			description={ i18n.fixMe( {
				text: 'Describe your idea and let AI help you refine your site.',
				newCopy: translate( 'Describe your idea and let AI help you refine your site.' ),
				oldCopy: translate( 'Prompt, edit, and launch a site in just a few clicks.' ),
			} ) }
			decoration={ <BigSkyLogo.CentralLogo heartless /> }
			onClick={ handleBuildWithAIClick }
		/>
	);

	const stepContent = (
		<VStack alignment="top" spacing={ 3 }>
			{ showPromptInput ? buildWithAIPromptCard : buildWithAISummary }
			<SummaryButton
				title={ i18n.fixMe( {
					text: 'Manual setup',
					newCopy: translate( 'Manual setup' ),
					oldCopy: translate( 'Start with a blank site' ),
				} ) }
				description={ translate(
					'Get started instantly with a simple, ready-to-go WordPress site.'
				) }
				decoration={ <Icon icon={ layout } /> }
				onClick={ handleBlankSite }
			/>
			{ isAutomattician && (
				<SummaryButton
					title="Generate Theme"
					description="Automattician only: provision a WordPress.com Cloud site and generate a custom theme with AI."
					decoration={ <Icon icon={ brush } /> }
					onClick={ handleGenerateTheme }
				/>
			) }
		</VStack>
	);

	return (
		<Step.CenteredColumnLayout
			className="setup-your-site-ai-step"
			columnWidth={ 5 }
			verticalAlign="center"
			topBar={ <Step.TopBar /> }
			heading={
				<Step.Heading
					text={ translate( 'Set up your site' ) }
					subText={ i18n.fixMe( {
						text: "Whatever you're making, there's an easy way to get started.",
						newCopy: translate( "Whatever you're making, there's an easy way to get started." ),
						oldCopy: translate(
							"No matter what you want to do, there's an easy way to get started."
						),
					} ) }
				/>
			}
		>
			{ stepContent }
		</Step.CenteredColumnLayout>
	);
};

export default SetupYourSiteAIStep;
