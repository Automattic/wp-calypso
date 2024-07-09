import type { Moment } from 'moment';

type StatsDefaultModuleProps = {
	className?: string;
	period: StatsPeriodType;
	query: StatsQueryType;
	moduleStrings: {
		title: string;
		item: string;
		value: string;
		empty: string;
	};
};

type StatsAdvancedModuleWrapperProps = {
	siteId: number;
	period: StatsPeriodType;
	postId?: number;
	query: StatsQueryType;
	summary?: boolean;
	className?: string;
};

type StatsPeriodType = {
	period: StatsPeriodGrainType;
	key: string;
	startOf: Moment;
	endOf: Moment;
};

type StatsQueryType = {
	date: string;
	period: StatsPeriodGrainType;
};

type StatsPeriodGrainType = 'day' | 'week' | 'month' | 'year';

// TODO: updat this with the remaining properties when needed.
type StatsStateProps = {
	stats: {
		lists: {
			requests: boolean;
		};
	};
};

export type {
	StatsDefaultModuleProps,
	StatsAdvancedModuleWrapperProps,
	StatsStateProps,
	StatsPeriodType,
	StatsQueryType,
	StatsPeriodGrainType,
};
