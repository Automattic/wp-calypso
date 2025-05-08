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
	summaryUrl?: string;
	/**
	 * @property {boolean} summary Render page elements specific for a summary page, e.g. a download button.
	 */
	summary?: boolean;
	/**
	 * @property {string} listItemClassName Custom class name for list items (used on a summary page).
	 */
	listItemClassName?: string;
	/**
	 * @property {boolean} isRealTime Signals to the module to turn on diff rendering for real-time data.
	 */
	isRealTime?: boolean;
};

type StatsAdvancedModuleWrapperProps = {
	siteId: number;
	period: StatsPeriodType;
	postId?: number;
	query: StatsQueryType;
	summary?: boolean;
	className?: string;
	summaryUrl?: string;
	context?: {
		query?: {
			utmParam?: string;
			startDate?: string;
			endDate?: string;
			date?: string;
			[ key: string ]: string | undefined;
		};
		params?: {
			module?: string;
			[ key: string ]: string | undefined;
		};
		[ key: string ]: unknown;
	};
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
