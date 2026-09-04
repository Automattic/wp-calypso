import config from '@automattic/calypso-config';
import { BigSkyLogo, SummaryButton } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Icon,
	TextareaControl,
} from '@wordpress/components';
import { arrowUp, layout } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { planSupportsBuildWow } from 'calypso/landing/stepper/utils/build-wow-plans';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSignupCompleteSlug } from 'calypso/signup/storageUtils';
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
	// The custom design card goes to the build-wow AI theme generation flow (which
	// provisions a WP Cloud site up front) on any Atomic-capable plan. That flow
	// lives behind the site-spec feature, so without it the card falls back to the
	// legacy builder.
	// Prefer the cart item (what was just bought) over site.plan, which can be
	// stale before the plan assignment syncs. The cart item persists across runs,
	// so only trust it when the checkout it came from was for this site.
	const planCartItem = usePlanCartItem();
	const boughtPlanSlug =
		getSignupCompleteSlug() === siteSlug ? planCartItem?.product_slug : undefined;
	const offerBuildWow =
		config.isEnabled( 'site-spec' ) &&
		planSupportsBuildWow( boughtPlanSlug ?? site?.plan?.product_slug );

	// One choice per visit: submitting navigates away, so the controls disable and
	// later clicks are ignored. The ref covers clicks landing before the re-render.
	const isSubmittingRef = useRef( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	// A submit leaves the page, so Back can restore it from bfcache with the
	// controls still disabled; re-enable them on that restore.
	useEffect( () => {
		const onPageShow = ( event: PageTransitionEvent ) => {
			if ( event.persisted ) {
				isSubmittingRef.current = false;
				setIsSubmitting( false );
			}
		};
		window.addEventListener( 'pageshow', onPageShow );
		return () => window.removeEventListener( 'pageshow', onPageShow );
	}, [] );

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

	const submitGenerateTheme = () => {
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'generate-theme',
		} );

		navigation.submit( {
			setupChoice: 'generate-theme',
			siteSlug,
			siteId,
		} );
	};

	// The Woo hosting-solutions prompt form always stays on the legacy builder:
	// only that path runs the store spec interview (store type, address for tax
	// and shipping) and a WooCommerce-aware build.
	const handleBuildWithAISubmit = ( event: FormEvent ) => {
		event.preventDefault();
		if ( ! claimSubmit() ) {
			return;
		}
		submitBuildWithAI( prompt.trim() );
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
