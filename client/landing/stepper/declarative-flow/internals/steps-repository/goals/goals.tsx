import { Onboard } from '@automattic/data-stores';
import { useLocale, isLocaleRtl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { shuffleArray } from '../../../../utils/shuffle-array';
import type { Goal } from './types';

const SiteGoal = Onboard.SiteGoal;

export const useGoals = ( isAddedGoalsExp: boolean ): Goal[] => {
	loadExperimentAssignment( 'calypso_design_picker_image_optimization_202406' ); // Temporary for A/B test.

	const translate = useTranslate();
	const locale = useLocale();

	const addedGoalsExpResult = useMemo( () => {
		const goals = [
			{
				key: SiteGoal.Write,
				title: translate( 'Publish a blog' ),
			},
			{
				key: SiteGoal.Engagement,
				title: translate( 'Build and engage an audience' ),
			},
			{
				key: SiteGoal.CollectDonations,
				title: translate( 'Collect donations' ),
			},
			{
				key: SiteGoal.Porfolio,
				title: translate( 'Showcase work/portfolio' ),
			},
			{
				key: SiteGoal.BuildNonprofit,
				title: translate( 'Build a site for a school or nonprofit' ),
			},
			{
				key: SiteGoal.Newsletter,
				title: translate( 'Create a newsletter' ),
			},
			{
				key: SiteGoal.SellDigital,
				title: translate( 'Sell services or digital goods' ),
			},
			{
				key: SiteGoal.SellPhysical,
				title: translate( 'Sell physical goods' ),
			},
			{
				key: SiteGoal.Promote,
				title: translate( 'Promote my business' ),
			},
			{
				key: SiteGoal.Courses,
				title: translate( 'Create a course' ),
			},
			{
				key: SiteGoal.ContactForm,
				title: translate( 'Create a contact form' ),
			},
			{
				key: SiteGoal.Videos,
				title: translate( 'Upload videos' ),
			},
			{
				key: SiteGoal.PaidSubscribers,
				title: translate( 'Offer paid content to members' ),
			},
			{
				key: SiteGoal.AnnounceEvents,
				title: translate( 'Announce events' ),
			},
		];

		return shuffleArray( goals );
	}, [ translate ] );

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
			title: translate( 'Let us build your site in 4 days' ),
			isPremium: true,
		},
		{
			key: SiteGoal.Import,
			title: translate( 'Import existing content or website' ),
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

	if ( isAddedGoalsExp ) {
		return addedGoalsExpResult;
	}

	return goals.filter( hideDIFMGoalForUnsupportedLocales );
};
