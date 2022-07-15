import { Onboard } from '@automattic/data-stores';

export type Goal = {
	key: Onboard.SiteGoal;
	title: React.ReactChild | string;
	isPremium?: boolean;
};
