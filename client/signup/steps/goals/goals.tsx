import { useTranslate } from 'i18n-calypso';
import { GoalId } from './constants';
import type { Goal } from './types';

export const useIntents = (): Goal[] => {
	const translate = useTranslate();

	const goals: Goal[] = [
		{
			id: GoalId.Write,
			label: translate( 'Write and publish' ),
		},
		{
			id: GoalId.Sell,
			label: translate( 'Sell goods or products' ),
		},
		{
			id: GoalId.Promote,
			label: translate( 'Promote myself or my business' ),
		},
		{
			id: GoalId.DIFM,
			label: translate( 'Hire a professional to design my website' ),
		},
		{
			id: GoalId.Import,
			label: translate( 'Import my existing website content' ),
		},
		{
			id: GoalId.Other,
			label: translate( 'Other' ),
		},
	];

	return goals;
};
