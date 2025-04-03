import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { OnboardSelect, ProductsList } from '@automattic/data-stores';
import { themesIllustrationImage } from '@automattic/design-picker';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Step, StepContainer, isOnboardingFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { ONBOARD_STORE } from '../../../../stores';
import kebabCase from '../../../../utils/kebabCase';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { useBigSkyBeforePlans } from '../../../helpers/use-bigsky-before-plans-experiment';
import bigSkyBg from './big-sky-bg.png';
import bigSkyFg from './big-sky-fg.png';
import hiBigSky from './big-sky-no-text.svg';
import DesignChoice from './design-choice';
import GoalsFirstDesignChoice from './goals-first-design-choice';
import themeChoiceFg from './theme-choice-fg.png';
import type { Step as StepType } from '../../types';

import './style.scss';

/**
 * The design choices step
 */
const DesignChoicesStep: StepType< { submits: { destination: string } } > = ( {
	navigation,
	flow,
	stepName,
} ) => {
	const [ , isBigSkyBeforePlansExperiment ] = useBigSkyBeforePlans(); // If the experiment hasn't loaded yet, then it must mean we're ineligible anyway
	const isGoalsFirstVariation = isOnboardingFlow( flow ) && isBigSkyBeforePlansExperiment;
	const isUsingStepContainerV2 = shouldUseStepContainerV2( flow );

	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const { submit, goBack } = navigation;

	let documentHeaderText = translate( 'Bring your vision to life' );
	let headerText = translate( 'Time to build your site!{{br/}}How would you like to get started?', {
		components: {
			br: <br />,
		},
	} );

	if ( isGoalsFirstVariation ) {
		documentHeaderText = headerText = translate( 'How would you like to start?' );
	}

	const subHeaderText = isGoalsFirstVariation
		? translate( 'Select an option to begin. You can always change your mind later.' )
		: undefined;
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const personalProduct = useSelect(
		( select ) =>
			// Ensure we only trigger network request when it's needed
			isGoalsFirstVariation
				? select( ProductsList.store ).getProductBySlug( PLAN_PERSONAL )
				: undefined,
		[ isGoalsFirstVariation ]
	);

	const { isEligible, isLoading } = useIsBigSkyEligible();

	useEffect( () => {
		if ( ! isLoading && isEligible ) {
			recordTracksEvent( 'calypso_big_sky_view_choice', {
				flow,
				step: stepName,
			} );
		}
	}, [ isEligible, isLoading, flow, stepName ] );

	const handleSubmit = ( destination: string ) => {
		recordTracksEvent( 'calypso_signup_design_choices_submit', {
			flow,
			step: stepName,
			intent,
			destination: kebabCase( destination ),
		} );

		submit?.( { destination } );
	};

	const getCreateWithAILabel = () => {
		if ( hasEnTranslation( 'Create with AI {{small}}(BETA){{/small}}' ) ) {
			return translate( 'Create with AI {{small}}(BETA){{/small}}', {
				components: {
					small: <span className="design-choices__beta-label" />,
				},
			} );
		}

		if ( hasEnTranslation( 'Create with AI' ) ) {
			return translate( '%s {{small}}(BETA){{/small}}', {
				args: [ translate( 'Create with AI' ) ],
				components: {
					small: <span className="design-choices__beta-label" />,
				},
				comment: 'Do not translate',
			} );
		}

		return translate( 'Create with AI (BETA)' );
	};

	const bigSkyBadgeLabel = () => {
		if ( ! isLoading && isEligible && personalProduct?.cost_per_month_display ) {
			if ( hasEnTranslation( 'Starting at %(price)s/month' ) ) {
				return translate( 'Starting at %(price)s/month', {
					args: { price: personalProduct.cost_per_month_display },
					comment: 'Translators: "price" is a per month price and includes a currency symbol',
				} );
			}

			return translate( 'Starting at %(price)s a month', {
				args: { price: personalProduct.cost_per_month_display },
				comment: 'Translators: "price" is a per month price and includes a currency symbol',
			} );
		}

		return undefined;
	};

	const stepContent = (
		<>
			{ ! isGoalsFirstVariation ? (
				<DesignChoice
					title={ translate( 'Choose a theme' ) }
					description={ translate( 'Choose one of our professionally designed themes.' ) }
					imageSrc={ themesIllustrationImage }
					destination="design-setup"
					onSelect={ handleSubmit }
				/>
			) : (
				<GoalsFirstDesignChoice
					title={ translate( 'Start with a theme' ) }
					description={ translate( 'Choose a professionally designed theme and make it yours.' ) }
					fgImageSrc={ themeChoiceFg }
					destination="design-setup"
					onSelect={ handleSubmit }
				/>
			) }
			{ ! isLoading && isEligible && ! isGoalsFirstVariation && (
				<DesignChoice
					className="design-choices__try-big-sky"
					title={ translate( 'Create your site with AI' ) }
					description={ translate( 'Tell our AI what you need, and watch it come to life.' ) }
					bgImageSrc={ hiBigSky }
					destination="launch-big-sky"
					onSelect={ ( destination ) => {
						recordTracksEvent( 'calypso_big_sky_choose', {
							flow,
							step: stepName,
						} );
						handleSubmit( destination );
					} }
				/>
			) }
			{ ! isLoading && isEligible && isGoalsFirstVariation && (
				<GoalsFirstDesignChoice
					title={ getCreateWithAILabel() }
					ariaLabel={ translate( 'Create with AI (BETA)' ) }
					description={
						hasEnTranslation(
							'Use our AI Website Builder to quickly and easily create the site of your dreams.'
						)
							? translate(
									'Use our AI Website Builder to quickly and easily create the site of your dreams.'
							  )
							: translate(
									'Use our AI website builder to easily and quickly build the site of your dreams.'
							  )
					}
					badgeLabel={ bigSkyBadgeLabel() }
					bgImageSrc={ bigSkyBg }
					fgImageSrc={ bigSkyFg }
					destination="launch-big-sky"
					onSelect={ ( destination ) => {
						handleSubmit( destination );
					} }
				/>
			) }
		</>
	);

	if ( isUsingStepContainerV2 ) {
		return (
			<>
				<DocumentHead title={ documentHeaderText } />
				<Step.CenteredColumnLayout
					columnWidth={ 8 }
					className={ clsx( 'design-choices__body', {
						'is-goals-first': isGoalsFirstVariation,
					} ) }
					topBar={
						<Step.TopBar
							leftElement={
								navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
							}
						/>
					}
					heading={ <Step.Heading text={ documentHeaderText } subText={ subHeaderText } /> }
				>
					{ stepContent }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ documentHeaderText } />
			<StepContainer
				flowName={ flow }
				stepName={ stepName }
				isHorizontalLayout={ false }
				formattedHeader={
					<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
				}
				stepContent={
					<div
						className={ clsx( 'design-choices__body', {
							'is-goals-first': isGoalsFirstVariation,
						} ) }
					>
						{ stepContent }
					</div>
				}
				goBack={ goBack }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default DesignChoicesStep;
