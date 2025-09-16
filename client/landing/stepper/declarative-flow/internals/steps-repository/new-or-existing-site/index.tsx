import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { WordPressLogo } from '@automattic/components';
import { type OnboardSelect } from '@automattic/data-stores';
import {
	type SelectItem,
	IntentScreen,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	StepContainer,
	isStartWritingFlow,
	START_WRITING_FLOW,
	READYMADE_TEMPLATE_FLOW,
	DOMAIN_FLOW,
	Step,
} from '@automattic/onboarding';
import { Icon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { globe } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { ONBOARD_STORE } from '../../../../stores';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import NewSiteIcon from './icons/new-site';
import { ChoiceType } from './types';
import type { Step as StepType } from '../../types';

import './styles.scss';

type NewOrExistingSiteIntent = SelectItem< ChoiceType >;

const useIntentsForFlow = ( flowName: string ): NewOrExistingSiteIntent[] => {
	const { productCartItems, domainCartItem } = useSelect(
		( select ) => ( {
			signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
			domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			productCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getProductCartItems(),
		} ),
		[]
	);

	const mergedCartItems = [ domainCartItem, ...( productCartItems ?? [] ) ].filter(
		( item ) => !! item
	);

	const hasDomainOperation = mergedCartItems.some( ( item ) =>
		[ 'domain_transfer', 'domain_map' ].includes( item.product_slug )
	);

	const translate = useTranslate();
	switch ( flowName ) {
		case HUNDRED_YEAR_PLAN_FLOW:
		case HUNDRED_YEAR_DOMAIN_FLOW:
			return [
				{
					key: 'existing-site',
					title: translate( 'Existing WordPress.com site' ),
					description: (
						<p>
							{ translate( 'Upgrade an existing site to the %(planTitle)s.', {
								args: {
									planTitle: getPlan( PLAN_100_YEARS )?.getTitle() || '',
								},
							} ) }
						</p>
					),
					icon: <WordPressLogo size={ 24 } />,
					value: 'existing-site',
					actionText: translate( 'Select a site' ),
				},
				{
					key: 'new-site',
					title: translate( 'New site' ),
					description: (
						<p>
							{ translate(
								"Craft your legacy from the ground up. We'll be by your side every step of the way."
							) }
						</p>
					),
					icon: <NewSiteIcon />,
					value: 'new-site',
					actionText: translate( 'Start a new site' ),
				},
			];
		case START_WRITING_FLOW:
		case READYMADE_TEMPLATE_FLOW:
			return [
				{
					key: 'existing-site',
					title: translate( 'Existing WordPress.com site' ),
					description: '',
					icon: <WordPressLogo size={ 24 } />,
					value: 'existing-site',
					actionText: translate( 'Select a site' ),
				},
				{
					key: 'new-site',
					title: translate( 'New site' ),
					description: '',
					icon: <NewSiteIcon />,
					value: 'new-site',
					actionText: translate( 'Start a new site' ),
				},
			];
		case DOMAIN_FLOW: {
			const options = [
				{
					key: 'new-site',
					title: translate( 'New site' ),
					description: translate(
						'Customize and launch your site.{{br/}}{{freeDomainPromo}}Free domain for the first year on annual plans.{{/freeDomainPromo}}',
						{
							components: {
								freeDomainPromo: <span className="new-or-existing-site__free-domain-promo" />,
								br: <br aria-hidden="true" />,
							},
						}
					),
					icon: <NewSiteIcon />,
					value: 'new-site',
					actionText: translate( 'Create a new site' ),
				},
				{
					key: 'existing-site',
					title: translate( 'Existing WordPress.com site' ),
					description: translate(
						'Use the domain with a site you already started.{{br/}}{{freeDomainPromo}}Free domain for the first year on annual plans.{{/freeDomainPromo}}',
						{
							components: {
								freeDomainPromo: <span className="new-or-existing-site__free-domain-promo" />,
								br: <br aria-hidden="true" />,
							},
						}
					),
					icon: <WordPressLogo size={ 24 } />,
					value: 'existing-site',
					actionText: translate( 'Select a site' ),
				},
			];

			if ( ! hasDomainOperation ) {
				options.unshift( {
					key: 'domain',
					title: translate( 'Just buy a domain' ),
					description: translate( 'Add a site later.' ),
					icon: <Icon icon={ globe } />,
					value: 'domain',
					actionText: translate( 'Continue' ),
				} );
			}

			return options as NewOrExistingSiteIntent[];
		}
		default:
			return [];
	}
};

const NewOrExistingSiteStep: StepType< { submits: { newExistingSiteChoice: ChoiceType } } > =
	function NewOrExistingSiteStep( { navigation, flow } ) {
		const { submit, goBack } = navigation;
		const translate = useTranslate();

		const intents = useIntentsForFlow( flow );

		const onSelect = ( value: ChoiceType ) => {
			submit?.( { newExistingSiteChoice: value } );
		};

		const getHeaderText = () => {
			if ( isStartWritingFlow( flow ) ) {
				return translate( 'New or existing site' );
			}
			switch ( flow ) {
				case HUNDRED_YEAR_PLAN_FLOW:
				case HUNDRED_YEAR_DOMAIN_FLOW:
					return translate( 'Start your legacy' );
				case DOMAIN_FLOW:
					return translate( 'Choose how to use your domain' );
				default:
					return null;
			}
		};

		const getSubHeaderText = () => {
			switch ( flow ) {
				case DOMAIN_FLOW:
					return translate( 'Don’t worry, you can easily change it later.' );
				default:
					return null;
			}
		};

		if ( shouldUseStepContainerV2( flow ) ) {
			return (
				<Step.CenteredColumnLayout
					columnWidth={ 5 }
					className="step-container-v2--new-or-existing-site"
					topBar={
						<Step.TopBar leftElement={ goBack ? <Step.BackButton onClick={ goBack } /> : null } />
					}
					heading={ <Step.Heading text={ getHeaderText() } subText={ getSubHeaderText() } /> }
				>
					<IntentScreen
						intents={ intents }
						onSelect={ onSelect }
						preventWidows={ preventWidows }
						intentsAlt={ [] }
					/>
				</Step.CenteredColumnLayout>
			);
		}

		const Container = [ HUNDRED_YEAR_PLAN_FLOW, HUNDRED_YEAR_DOMAIN_FLOW ].includes( flow )
			? HundredYearPlanStepWrapper
			: StepContainer;

		return (
			<Container
				stepContent={
					<IntentScreen
						intents={ intents }
						onSelect={ onSelect }
						preventWidows={ preventWidows }
						intentsAlt={ [] }
					/>
				}
				formattedHeader={
					<FormattedHeader
						brandFont
						headerText={ getHeaderText() }
						subHeaderText={ getSubHeaderText() }
					/>
				}
				justifyStepContent="center"
				stepName="new-or-existing-site"
				flowName={ flow }
				recordTracksEvent={ recordTracksEvent }
				hideBack={ isStartWritingFlow( flow ) }
			/>
		);
	};

export default NewOrExistingSiteStep;
