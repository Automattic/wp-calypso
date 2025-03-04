import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { WordPressLogo } from '@automattic/components';
import {
	type SelectItem,
	IntentScreen,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	StepContainer,
	isStartWritingFlow,
	START_WRITING_FLOW,
	READYMADE_TEMPLATE_FLOW,
} from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
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
		default:
			return [];
	}
};

const NewOrExistingSiteStep: Step = function NewOrExistingSiteStep( { navigation, flow } ) {
	const { submit } = navigation;
	const translate = useTranslate();

	const intents = useIntentsForFlow( flow );

	const newOrExistingSiteSelected = ( value: ChoiceType ) => {
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
			default:
				return null;
		}
	};

	const Container = [ HUNDRED_YEAR_PLAN_FLOW, HUNDRED_YEAR_DOMAIN_FLOW ].includes( flow )
		? HundredYearPlanStepWrapper
		: StepContainer;

	return (
		<Container
			stepContent={
				<IntentScreen
					intents={ intents }
					onSelect={ newOrExistingSiteSelected }
					preventWidows={ preventWidows }
					intentsAlt={ [] }
				/>
			}
			formattedHeader={ <FormattedHeader brandFont headerText={ getHeaderText() } /> }
			justifyStepContent="center"
			stepName="new-or-existing-site"
			flowName={ flow }
			recordTracksEvent={ recordTracksEvent }
			hideBack={ isStartWritingFlow( flow ) }
		/>
	);
};

export default NewOrExistingSiteStep;
