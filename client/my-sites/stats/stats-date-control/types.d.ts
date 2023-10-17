interface StatsDateControlProps {
	slug: string;
	queryParams: string;
	period: 'day' | 'week' | 'month' | 'year';
	pathTemplate: string;
}

interface DateControlPickerProps {
	shortcutList: DateControlPickerShortcut[];
	onShortcut: ( shortcut: DateControlPickerShortcut ) => void;
	onApply: ( startDate: string, endDate: string ) => void;
}

interface DateControlPickerShortcutsProps {
	shortcutList: DateControlPickerShortcut[];
	currentShortcut: string;
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
