import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import type { Goal } from './types';

const SiteGoal = Onboard.SiteGoal;

export const useGoals = (): Goal[] => {
	const translate = useTranslate();
	return [
		{
			key: SiteGoal.Write,
			title: translate( 'Write and publish' ),
		},
		{
			key: SiteGoal.Sell,
			title: translate( 'Sell goods or products' ),
		},
		{
			key: SiteGoal.Promote,
			title: translate( 'Promote myself or my business' ),
		},
		{
			key: SiteGoal.DIFM,
			title: translate( 'Hire a professional to design my website' ),
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
	].filter( ( { key } ) => key !== Onboard.SiteGoal.Import );
};
