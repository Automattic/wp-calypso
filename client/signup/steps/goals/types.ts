import { GoalId } from './constants';

export type Goal = {
	id: GoalId;
	label: React.ReactChild | string;
	isPremium?: boolean;
};
