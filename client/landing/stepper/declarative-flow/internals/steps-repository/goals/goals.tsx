import { Onboard } from '@automattic/data-stores';
import { useLocale, englishLocales } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import type { Goal } from './types';

const SiteGoal = Onboard.SiteGoal;

const DIFMSupportedLocales = [ ...englishLocales, 'es' ];

// export const CALYPSO_BUILTBYEXPRESS_GOAL_TEXT_EXPERIMENT_NAME =
// 	'calypso_builtbyexpress_goal_copy_change_202210';
// export const VARIATION_CONTROL = 'control';
// export const VARIATION_BUY = 'variation_buy';
// export const VARIATION_GET = 'variation_get';

const useBBEGoal = () => {
	const translate = useTranslate();
	const locale = useLocale();
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

	return locale === 'en'
		? translate( 'Let us build your site in 4 days' )
		: translate( 'Get a website built quickly' );
};

export const useGoals = (): Goal[] => {
	const translate = useTranslate();
	const locale = useLocale();
	const builtByExpressGoalDisplayText = useBBEGoal();

	const importDisplayText = () => {
		return translate( 'Import existing content or website' );
	};

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
			title: importDisplayText(),
		},
		{
			key: SiteGoal.Other,
			title: translate( 'Other' ),
		},
	];

	/**
	 * Hides the DIFM goal for all locales except English and ES.
	 */
	const hideDIFMGoalForUnsupportedLocales = ( { key }: Goal ) => {
		if ( key === SiteGoal.DIFM && ! DIFMSupportedLocales.includes( locale ) ) {
			return false;
		}
		return true;
	};

	return goals.filter( hideDIFMGoalForUnsupportedLocales );
};
