import { Onboard } from '@automattic/data-stores';
import { useLocale, isLocaleRtl, useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import type { Goal } from './types';

const SiteGoal = Onboard.SiteGoal;

export const useGoals = (): Goal[] => {
	loadExperimentAssignment( 'calypso_design_picker_image_optimization_202406' ); // Temporary for A/B test.

	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const locale = useLocale();

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
			title: hasEnTranslation( 'Let us build your site in 4 days' )
				? translate( 'Let us build your site in 4 days' )
				: translate( 'Get a website built quickly' ),
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
	 * Hides the DIFM goal for RTL locales.
	 */
	const hideDIFMGoalForUnsupportedLocales = ( { key }: Goal ) => {
		if ( key === SiteGoal.DIFM && isLocaleRtl( locale ) ) {
			return false;
		}
		return true;
	};

	return goals.filter( hideDIFMGoalForUnsupportedLocales );
};
