import { Onboard } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useExperiment } from 'calypso/lib/explat';
import type { Goal } from './types';

export const CALYPSO_DIFM_GOAL_TEXT_EXPERIMENT_NAME = 'calypso_difm_goal_change_prototype';
export const VARIATION_CONTROL = 'control';
export const VARIATION_BUY = 'variation_buy';
export const VARIOATION_GET = 'variation_get';

const SiteGoal = Onboard.SiteGoal;
const HIDE_GOALS = [ SiteGoal.DIFM, SiteGoal.Import ];
const shouldDisplayGoal = ( { key }: Goal ) => ! HIDE_GOALS.includes( key );

export const useGoals = ( displayAllGoals = false ): Goal[] => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const [ , experimentAssignment ] = useExperiment( CALYPSO_DIFM_GOAL_TEXT_EXPERIMENT_NAME );
	let variationName = experimentAssignment?.variationName;

	let difmGoalDisplayText;
	variationName = VARIOATION_GET;
	switch ( variationName ) {
		case VARIATION_BUY:
			difmGoalDisplayText = translate( 'Buy a website' );
			break;
		case VARIOATION_GET:
			difmGoalDisplayText = translate( 'Get a website quickly' );
			break;
		case VARIATION_CONTROL:
		default:
			difmGoalDisplayText = translate( 'Hire a professional to design my website' );
	}

	const goals = [
		{
			key: SiteGoal.Write,
			title: translate( 'Write & Publish' ),
		},
		{
			key: SiteGoal.Sell,
			title: translate( 'Sell online' ),
		},
		{
			key: SiteGoal.Promote,
			title: translate( 'Promote myself or business' ),
		},
		{
			key: SiteGoal.DIFM,
			title: difmGoalDisplayText,
			isPremium: true,
		},
		{
			key: SiteGoal.Import,
			title: translate( 'Import my existing website content' ),
		},
		{
			key: SiteGoal.Other,
			title: translate( 'Other' ),
		},
	];

	const hideDIFMGoalForNonEN = ( { key }: Goal ) => {
		if ( key === SiteGoal.DIFM && ! isEnglishLocale ) {
			return false;
		}
		return true;
	};

	return displayAllGoals ? goals.filter( hideDIFMGoalForNonEN ) : goals.filter( shouldDisplayGoal );
};
