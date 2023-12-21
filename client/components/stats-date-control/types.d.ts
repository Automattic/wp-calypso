interface StatsDateControlProps {
	slug: string;
	queryParams: string;
	period: 'day' | 'week' | 'month' | 'year';
	dateRange: any;
	shortcutList: DateControlPickerShortcut[];
	overlay?: JSX.Element;
}

interface DateControlPickerProps {
	buttonLabel: string;
	dateRange: any;
	shortcutList: DateControlPickerShortcut[];
	selectedShortcut: string | undefined;
	onShortcut: ( shortcut: DateControlPickerShortcut ) => void;
	onApply: ( startDate: string, endDate: string ) => void;
	overlay?: JSX.Element;
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
	statType: string;
	isGated: boolean;
	onGatedClick: (
		events: { name: string; params?: object }[],
		event_from: 'jetpack_odyssey' | 'calypso'
	) => void;
}

interface DateControlPickerDateProps {
	startDate?: string;
	endDate?: string;
	onStartChange: ( value: string ) => void;
	onEndChange: ( value: string ) => void;
	onApply: () => void;
	onCancel: () => void;
	overlay?: JSX.Element;
}

export {
	StatsDateControlProps,
	DateControlPickerProps,
	DateControlPickerShortcut,
	DateControlPickerShortcutsProps,
	DateControlPickerDateProps,
};
