interface DateControlProps {
	onApplyButtonClick: ( startDate: Moment, endDate: Moment ) => void;
	onDateControlClick?: () => void;
	dateRange: {
		chartStart: string;
		chartEnd: string;
		daysInRange: number;
	};
	shortcutList: DateControlPickerShortcut[];
	onShortcutClick: ( shortcutId: string ) => void;
	tooltip?: string;
	overlay?: JSX.Element;
	// Temporary prop to enable new date filtering UI.
	isNewDateFilteringEnabled?: boolean;
}

interface DateControlPickerProps {
	buttonLabel: string;
	dateRange: any;
	shortcutList: DateControlPickerShortcut[];
	selectedShortcut: string | undefined;
	onShortcut: ( shortcut: DateControlPickerShortcut ) => void;
	onApply: ( startDate: string, endDate: string ) => void;
	overlay?: JSX.Element;
	onGatedHandler: (
		events: { name: string; params?: object }[],
		event_from: string,
		stat_type: string
	) => void;
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
	statType?: string;
	isGated?: boolean;
	shortcutId?: string;
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
	DateControlProps,
	DateControlPickerProps,
	DateControlPickerShortcut,
	DateControlPickerShortcutsProps,
	DateControlPickerDateProps,
};
