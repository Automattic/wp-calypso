import { isAutomatticianQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { BigSkyLogo, SummaryButton } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
	Icon,
	TextareaControl,
} from '@wordpress/components';
import { arrowUp, layout, brush } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { FormEvent, useRef, useState } from 'react';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { planSupportsBuildWow } from 'calypso/landing/stepper/utils/build-wow-plans';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePlanCartItem } from '../../../../hooks/use-plan-cart-item';
import { useQuery } from '../../../../hooks/use-query';
import { useSiteData } from '../../../../hooks/use-site-data';
import { usePurchasePlanNotification } from '../../hooks/use-purchase-plan-notification';
import type { Step as StepType } from '../../types';
import './style.scss';

const SetupYourSiteAIStep: StepType = ( { navigation } ) => {
	const { site, siteSlug, siteId } = useSiteData();
	const translate = useTranslate();
	const ref = useQuery().get( 'ref' );

	// After checkout the `post-checkout-onboarding` step flags the site for a
	// "plan is now active" toast; consume it here since this is where the user
	// lands post-purchase.
	usePurchasePlanNotification( siteId, site?.plan?.product_slug );
	const showPromptInput = ref === WOO_HOSTING_SOLUTIONS_REF;
	const [ prompt, setPrompt ] = useState( '' );
	// Where the site builder swap is enabled, the custom design card goes to the
	// build-wow AI theme generation flow (which provisions a WP Cloud site up
	// front) on any Atomic-capable plan, and Automatticians get a link back to the
	// previous Big Sky builder. Otherwise Automatticians get a separate "Generate
	// Theme" card into build-wow, as before the swap.
	const { data: isAutomattician } = useReactQuery( isAutomatticianQuery() );
	const swapSiteBuilders =
		config.isEnabled( 'calypso/ai-site-builder-build-wow' ) && config.isEnabled( 'site-spec' );
	// Prefer the cart item (what was just bought) over site.plan, which can be
	// stale before the plan assignment syncs.
	const planCartItem = usePlanCartItem();
	const offerBuildWow =
		swapSiteBuilders &&
		planSupportsBuildWow( planCartItem?.product_slug ?? site?.plan?.product_slug );

	// One choice per visit: submitting navigates away, so the controls disable and
	// later clicks are ignored. The ref covers clicks landing before the re-render.
	const isSubmittingRef = useRef( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const claimSubmit = () => {
		if ( isSubmittingRef.current ) {
			return false;
		}
		isSubmittingRef.current = true;
		setIsSubmitting( true );
		return true;
	};

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

	const submitGenerateTheme = ( trimmedPrompt?: string ) => {
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'generate-theme',
			has_prompt: Boolean( trimmedPrompt ),
		} );

		navigation.submit( {
			setupChoice: 'generate-theme',
			siteSlug,
			siteId,
			prompt: trimmedPrompt || undefined,
		} );
	};

	const handleBuildWithAIClick = () => {
		if ( ! claimSubmit() ) {
			return;
		}
		submitBuildWithAI();
	};

	const handleBuildWithAISubmit = ( event: FormEvent ) => {
		event.preventDefault();
		if ( ! claimSubmit() ) {
			return;
		}

		const trimmedPrompt = prompt.trim();
		if ( offerBuildWow ) {
			submitGenerateTheme( trimmedPrompt );
			return;
		}

		submitBuildWithAI( trimmedPrompt );
	};

	const handleBlankSite = () => {
		if ( ! claimSubmit() ) {
			return;
		}
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'blank-site',
		} );

		navigation.submit( {
			setupChoice: 'blank-site',
			siteSlug,
		} );
	};

	const handleGenerateTheme = () => {
		if ( ! claimSubmit() ) {
			return;
		}
		submitGenerateTheme();
	};

	const handleCustomDesignClick = () => {
		if ( ! claimSubmit() ) {
			return;
		}

		if ( offerBuildWow ) {
			submitGenerateTheme();
			return;
		}

		submitBuildWithAI();
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
						disabled={ ! prompt.trim() || isSubmitting }
						accessibleWhenDisabled
					/>
				</div>
			</div>
		</form>
	);

	const buildWithAISummary = (
		<SummaryButton
			title={ i18n.fixMe( {
				text: 'Create a custom design',
				newCopy: translate( 'Create a custom design' ),
				oldCopy: translate( 'Build with AI' ),
			} ) }
			description={ i18n.fixMe( {
				text: 'Describe your idea and the WordPress Agent builds it.',
				newCopy: translate( 'Describe your idea and the WordPress Agent builds it.' ),
				oldCopy: translate( 'Describe your idea and let AI help you refine your site.' ),
			} ) }
			decoration={ <BigSkyLogo.CentralLogo heartless /> }
			onClick={ handleCustomDesignClick }
			disabled={ isSubmitting }
		/>
	);

	const legacySiteBuilderSection = offerBuildWow && isAutomattician && (
		<VStack spacing={ 1 } alignment="left" className="setup-your-site-ai-step__legacy-builder">
			<Step.LinkButton
				className="setup-your-site-ai-step__legacy-builder-link"
				onClick={ handleBuildWithAIClick }
				disabled={ isSubmitting }
			>
				Create a custom design with the legacy site builder
			</Step.LinkButton>
			<Text variant="muted" size={ 12 }>
				(Note: this link is only visible to Automatticians)
			</Text>
		</VStack>
	);

	const generateThemeCard = ! swapSiteBuilders && isAutomattician && (
		<SummaryButton
			title="Generate Theme"
			description="Automattician only: provision a WordPress.com Cloud site and generate a custom theme with AI."
			decoration={ <Icon icon={ brush } /> }
			onClick={ handleGenerateTheme }
			disabled={ isSubmitting }
		/>
	);

	const startWithTemplateCard = (
		<SummaryButton
			title={ i18n.fixMe( {
				text: 'Start with a template',
				newCopy: translate( 'Start with a template' ),
				oldCopy: translate( 'Manual setup' ),
			} ) }
			description={ i18n.fixMe( {
				text: 'Get a simple, ready-to-go site to make your own.',
				newCopy: translate( 'Get a simple, ready-to-go site to make your own.' ),
				oldCopy: translate( 'Get started instantly with a simple, ready-to-go WordPress site.' ),
			} ) }
			decoration={ <Icon icon={ layout } /> }
			onClick={ handleBlankSite }
			disabled={ isSubmitting }
		/>
	);

	const stepContent = (
		<VStack alignment="top" spacing={ 3 }>
			{ showPromptInput ? (
				<>
					{ buildWithAIPromptCard }
					{ startWithTemplateCard }
				</>
			) : (
				<>
					{ startWithTemplateCard }
					{ buildWithAISummary }
				</>
			) }
			{ legacySiteBuilderSection }
			{ generateThemeCard }
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
					text={ i18n.fixMe( {
						text: 'Let’s design your site',
						newCopy: translate( 'Let’s design your site' ),
						oldCopy: translate( 'Set up your site' ),
					} ) }
					subText={ i18n.fixMe( {
						text: 'Choose how to begin — you can change it anytime.',
						newCopy: translate( 'Choose how to begin — you can change it anytime.' ),
						oldCopy: translate( "Whatever you're making, there's an easy way to get started." ),
					} ) }
				/>
			}
		>
			{ stepContent }
		</Step.CenteredColumnLayout>
	);
};

export default SetupYourSiteAIStep;
