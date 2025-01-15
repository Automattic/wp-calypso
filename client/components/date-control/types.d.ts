import { DateRangePickerShortcut } from 'calypso/components/date-range/shortcuts';

interface DateControlProps {
	onApplyButtonClick: ( startDate: Moment, endDate: Moment ) => void;
	onDateControlClick?: () => void;
	dateRange: {
		chartStart: string;
		chartEnd: string;
		daysInRange: number;
	};
	shortcutList: DateRangePickerShortcut[];
	onShortcutClick: ( shortcut: DateRangePickerShortcut ) => void;
	tooltip?: string;
	overlay?: JSX.Element;
}

interface DateControlPickerProps {
	buttonLabel: string;
	dateRange: any;
	shortcutList: DateRangePickerShortcut[];
	selectedShortcut: string | undefined;
	onShortcut: ( shortcut: DateRangePickerShortcut ) => void;
	onApply: ( startDate: string, endDate: string ) => void;
	overlay?: JSX.Element;
	onGatedHandler: (
		events: { name: string; params?: object }[],
		event_from: string,
		stat_type: string
	) => void;
}

interface DateControlPickerShortcutsProps {
	shortcutList: DateRangePickerShortcut[];
	currentShortcut: string | undefined;
	onClick: ( shortcut: DateRangePickerShortcut ) => void;
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
	DateControlPickerShortcutsProps,
	DateControlPickerDateProps,
};
