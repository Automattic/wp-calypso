interface StatsDateControlProps {
	slug: string;
	queryParams: string;
	period: 'day' | 'week' | 'month' | 'year';
	pathTemplate: string;
}

interface DateControlPickerProps {
	slug: string;
	queryParams: string;
	shortcutList: DateControlPickerShortcut[];
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
