interface StatsDateControlProps {
	slug: string;
	queryParams: string;
	period: 'day' | 'week' | 'month' | 'year';
	dateRange: any;
	shortcutList: DateControlPickerShortcut[];
	overlay?: JSX.Element;
	onGatedHandler: (
		events: { name: string; params?: object }[],
		event_from: string,
		stat_type: string
	) => void;
}

export { StatsDateControlProps };
