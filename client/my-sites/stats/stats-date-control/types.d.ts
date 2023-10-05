interface StatsDateControlProps {
	slug: string;
	queryParams: string;
	period: 'day' | 'week' | 'month' | 'year';
	pathTemplate: string;
	onChangeChartQuantity: ( customQuantity: number ) => void;
}

interface DateControlPickerProps {
	slug: string;
	queryParams: string;
	shortcutList: DateControlPickerShortcut[];
	handleApply: ( startDate: string, endDate: string ) => void;
}

interface DateControlPickerShortcutsProps {
	shortcutList: DateControlPickerShortcut[];
	onClick: ( shortcut: DateControlPickerShortcut ) => void;
}

interface DateControlPickerShortcut {
	id?: string;
	label: string;
	offset: number;
	range: number;
}

interface DateControlPickerDateProps {
	startDate?: string;
	endDate?: string;
	onStartChange: ( value: string ) => void;
	onEndChange: ( value: string ) => void;
	onApply: () => void;
}

export {
	StatsDateControlProps,
	DateControlPickerProps,
	DateControlPickerShortcut,
	DateControlPickerShortcutsProps,
	DateControlPickerDateProps,
};
