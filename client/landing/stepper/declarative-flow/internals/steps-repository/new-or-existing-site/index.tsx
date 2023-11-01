import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { WordPressLogo } from '@automattic/components';
import {
	type SelectItem,
	IntentScreen,
	HUNDRED_YEAR_PLAN_FLOW,
	StepContainer,
	isBlogOnboardingFlow,
} from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import NewSiteIcon from './icons/new-site';
import { ChoiceType } from './types';
import type { Step } from '../../types';

import './styles.scss';

type NewOrExistingSiteIntent = SelectItem< ChoiceType >;

const useIntentsForFlow = ( flowName: string ): NewOrExistingSiteIntent[] => {
	const translate = useTranslate();
	if ( HUNDRED_YEAR_PLAN_FLOW === flowName ) {
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
	}
	return [
		{
			key: 'existing-site',
			title: translate( 'Existing WordPress.com site' ),
			description: <p>{ translate( 'Using an existing site' ) }</p>,
			icon: <WordPressLogo size={ 24 } />,
			value: 'existing-site',
			actionText: translate( 'Select a site' ),
		},
		{
			key: 'new-site',
			title: translate( 'New site' ),
			description: <p>{ translate( 'Creating a new site' ) }</p>,
			icon: <NewSiteIcon />,
			value: 'new-site',
			actionText: translate( 'Start a new site' ),
		},
	];
};

const NewOrExistingSiteStep: Step = function NewOrExistingSiteStep( { navigation, flow } ) {
	const { submit } = navigation;
	const translate = useTranslate();

	const intents = useIntentsForFlow( flow );

	const newOrExistingSiteSelected = ( value: ChoiceType ) => {
		submit?.( { newExistingSiteChoice: value } );
	};

	const getHeaderText = () => {
		if ( isBlogOnboardingFlow( flow ) ) {
			return translate( 'New or existing site' );
		}
		switch ( flow ) {
			case HUNDRED_YEAR_PLAN_FLOW:
				return translate( 'Start your legacy' );
			default:
				return null;
		}
	};

	const Container = flow === HUNDRED_YEAR_PLAN_FLOW ? HundredYearPlanStepWrapper : StepContainer;

	return (
		<>
			<Container
				stepContent={
					<IntentScreen
						intents={ intents }
						onSelect={ newOrExistingSiteSelected }
						preventWidows={ preventWidows }
						intentsAlt={ [] }
					/>
				}
				formattedHeader={
					<FormattedHeader brandFont headerText={ getHeaderText() } subHeaderAlign="center" />
				}
				justifyStepContent="center"
				stepName="new-or-existing-site"
				flowName={ flow }
				recordTracksEvent={ recordTracksEvent }
				hideBack={ isBlogOnboardingFlow( flow ) }
			/>
			{ isBlogOnboardingFlow( flow ) && <QuerySites allSites /> }
		</>
	);
};

export default NewOrExistingSiteStep;
