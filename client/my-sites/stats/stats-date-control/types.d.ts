interface StatsDateControlProps {
	slug: string;
	queryParams: string;
}

interface DateControlPickerProps {
	slug: string;
	queryParams: string;
}

interface DateControlPickerShortcutsProps {
	shortcutList: DateControlPickerShortcut[];
}

interface DateControlPickerShortcut {
	id?: string;
	label: string;
	onClick: () => void;
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
	DateControlPickerShortcutsProps,
	DateControlPickerDateProps,
};
