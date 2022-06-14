import { Onboard } from '@automattic/data-stores';

export type Goal = {
	key: Onboard.GoalKey;
	title: React.ReactChild | string;
	isPremium?: boolean;
};
