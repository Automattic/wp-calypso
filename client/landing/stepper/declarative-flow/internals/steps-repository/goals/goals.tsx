import { Onboard } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import type { Goal } from './types';

const SiteGoal = Onboard.SiteGoal;
const HIDE_GOALS = [ SiteGoal.DIFM, SiteGoal.Import ];
const shouldDisplayGoal = ( { key }: Goal ) => ! HIDE_GOALS.includes( key );

// export const CALYPSO_BUILTBYEXPRESS_GOAL_TEXT_EXPERIMENT_NAME =
// 	'calypso_builtbyexpress_goal_copy_change_202210';
// export const VARIATION_CONTROL = 'control';
// export const VARIATION_BUY = 'variation_buy';
// export const VARIATION_GET = 'variation_get';

const useBBEGoal = () => {
	const translate = useTranslate();

	// ************************************************************************
	// ****  Experiment skeleton left in for future BBE copy change tests  ****
	// ************************************************************************
	//

	// const [ , experimentAssignment ] = useExperiment(
	// 	CALYPSO_BUILTBYEXPRESS_GOAL_TEXT_EXPERIMENT_NAME
	// );
	// const variationName = experimentAssignment?.variationName;

	// let builtByExpressGoalDisplayText;
	// switch ( variationName ) {
	// 	case VARIATION_BUY:
	// 		builtByExpressGoalDisplayText = translate( 'Buy a website' );
	// 		break;
	// 	case VARIATION_GET:
	// 		builtByExpressGoalDisplayText = translate( 'Get a website quickly' );
	// 		break;
	// 	case VARIATION_CONTROL:
	// 	default:
	// 		builtByExpressGoalDisplayText = translate( 'Hire a professional to design my website' );
	// }
	//
	// ************************************************************************

	return translate( 'Get a website quickly' );
};

export const useGoals = ( displayAllGoals = false ): Goal[] => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const builtByExpressGoalDisplayText = useBBEGoal();

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
			title: builtByExpressGoalDisplayText,
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
