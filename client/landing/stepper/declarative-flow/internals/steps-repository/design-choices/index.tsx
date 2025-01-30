import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { OnboardSelect, ProductsList } from '@automattic/data-stores';
import { themesIllustrationImage } from '@automattic/design-picker';
import { localizeUrl } from '@automattic/i18n-utils';
import { StepContainer, isOnboardingFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { useIsBigSkyEligible } from '../../../../hooks/use-is-site-big-sky-eligible';
import { ONBOARD_STORE } from '../../../../stores';
import kebabCase from '../../../../utils/kebabCase';
import hiBigSky from './big-sky-no-text-small.png';
import DesignChoice from './design-choice';
import type { Step } from '../../types';
import './style.scss';

/**
 * The design choices step
 */
const DesignChoicesStep: Step = ( { navigation, flow, stepName } ) => {
	const isGoalsFirstVariation =
		isOnboardingFlow( flow ) && isEnabled( 'onboarding/big-sky-before-plans' );

	const translate = useTranslate();
	const { submit, goBack } = navigation;
	const headerText = translate( 'Bring your vision to life' );
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

	const bigSkyBadgeLabel =
		! isLoading && isEligible && personalProduct?.cost_per_month_display && isGoalsFirstVariation
			? translate( 'Starting at %(price)s a month', {
					args: { price: personalProduct.cost_per_month_display },
					comment: 'Translators: "price" is a per month price and includes a currency symbol',
			  } )
			: undefined;

	return (
		<>
			<DocumentHead title={ headerText } />
			<StepContainer
				flowName={ flow }
				stepName={ stepName }
				isHorizontalLayout={ false }
				formattedHeader={ <FormattedHeader headerText={ headerText } /> }
				stepContent={
					<>
						<div className="design-choices__body">
							<DesignChoice
								title={ translate( 'Choose a theme' ) }
								description={ translate( 'Choose one of our professionally designed themes.' ) }
								imageSrc={ themesIllustrationImage }
								destination="designSetup"
								onSelect={ handleSubmit }
							/>
							{ ! isLoading && isEligible && (
								<DesignChoice
									className="design-choices__try-big-sky"
									title={ translate( 'Design with AI' ) }
									description={ translate(
										'Use our AI website builder to easily and quickly build the site of your dreams.'
									) }
									imageSrc={ hiBigSky }
									destination="launch-big-sky"
									badgeLabel={ bigSkyBadgeLabel }
									footer={ preventWidows(
										translate(
											'To learn more about AI, you can review our {{a}}AI guidelines{{/a}}.',
											{
												components: {
													a: (
														<a
															href={ localizeUrl( 'https://automattic.com/ai-guidelines/' ) }
															target="_blank"
															rel="noreferrer noopener"
															onClick={ ( event ) => {
																recordTracksEvent( 'calypso_big_sky_ai_guidelines_click' );
																event.stopPropagation();
															} }
														/>
													),
												},
											}
										)
									) }
									onSelect={ ( destination ) => {
										recordTracksEvent( 'calypso_big_sky_choose', {
											flow,
											step: stepName,
										} );
										handleSubmit( destination );
									} }
								/>
							) }
						</div>
					</>
				}
				goBack={ goBack }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default DesignChoicesStep;
