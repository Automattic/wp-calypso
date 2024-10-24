import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import type { Goal } from './types';

const SiteGoal = Onboard.SiteGoal;

export const useGoals = (): Goal[] => {
	loadExperimentAssignment( 'calypso_design_picker_image_optimization_202406' ); // Temporary for A/B test.

	const translate = useTranslate();

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
			title: translate( 'Offer a contact form' ),
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

	return goals;
};
