type StatsDefaultModuleProps = {
	className?: string;
	period: string;
	query: {
		date: string;
		period: string;
	};
	moduleStrings: {
		title: string;
		item: string;
		value: string;
		empty: string;
	};
};

// TODO: updat this with the remaining properties when needed.
type StatsStateProps = {
	stats: {
		lists: {
			requests: boolean;
		};
	};
};

export type { StatsDefaultModuleProps, StatsStateProps };
