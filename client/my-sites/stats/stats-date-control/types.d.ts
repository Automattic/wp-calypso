interface StatsDateControlProps {
	slug: string;
	queryParams: string;
	period: 'day' | 'week' | 'month' | 'year';
	pathTemplate: string;
	dateRange: any;
}

interface DateControlPickerProps {
	buttonLabel: string;
	dateRange: any;
	shortcutList: DateControlPickerShortcut[];
	selectedShortcut: string | undefined;
	onShortcut: ( shortcut: DateControlPickerShortcut ) => void;
	onApply: ( startDate: string, endDate: string ) => void;
}

interface DateControlPickerShortcutsProps {
	shortcutList: DateControlPickerShortcut[];
	currentShortcut: string | undefined;
	onClick: ( shortcut: DateControlPickerShortcut ) => void;
}

interface DateControlPickerShortcut {
	id: string;
	label: string;
	offset: number;
	range: number;
	period: string;
}

interface DateControlPickerDateProps {
	startDate?: string;
	endDate?: string;
	onStartChange: ( value: string ) => void;
	onEndChange: ( value: string ) => void;
	onApply: () => void;
	onCancel: () => void;
}

export {
	StatsDateControlProps,
	DateControlPickerProps,
	DateControlPickerShortcut,
	DateControlPickerShortcutsProps,
	DateControlPickerDateProps,
};
