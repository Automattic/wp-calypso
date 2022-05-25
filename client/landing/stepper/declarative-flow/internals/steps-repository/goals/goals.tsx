import { useTranslate } from 'i18n-calypso';
import { GoalKey } from './constants';
import type { Goal } from './types';

export const useGoals = (): Goal[] => {
	const translate = useTranslate();

	const goals: Goal[] = [
		{
			key: GoalKey.Write,
			title: translate( 'Write and publish' ),
		},
		{
			key: GoalKey.Sell,
			title: translate( 'Sell goods or products' ),
		},
		{
			key: GoalKey.Promote,
			title: translate( 'Promote myself or my business' ),
		},
		{
			key: GoalKey.DIFM,
			title: translate( 'Hire a professional to design my website' ),
			isPremium: true,
		},
		{
			key: GoalKey.Import,
			title: translate( 'Import my existing website content' ),
		},
		{
			key: GoalKey.Other,
			title: translate( 'Other' ),
		},
	];

	return goals;
};
