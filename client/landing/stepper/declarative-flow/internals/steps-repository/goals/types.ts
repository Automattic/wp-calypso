import { GoalKey } from './constants';

export type Goal = {
	key: GoalKey;
	title: React.ReactChild | string;
	isPremium?: boolean;
};
