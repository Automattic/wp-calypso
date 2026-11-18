// 2026 nav taxonomy. A top-level entry is a dropdown (`groups`) or a link (`href`).
export interface Nav2026Item {
	label: string;
	url: string;
	target?: string;
	badge?: string;
	isExternal?: boolean;
}

export interface Nav2026Group {
	title: string;
	// Pill shown next to the group title.
	badge?: string;
	items: Nav2026Item[];
	// Groups sharing a key stack vertically in one desktop column; unset = own column.
	columnGroup?: string;
	// Desktop column order; the array order stays the mobile list order.
	columnIndex?: number;
	// The group's column lays out on its own instead of on the rows shared across
	// columns, so a long list in it does not push the other columns' second row down.
	isStackedColumn?: boolean;
}

export type Nav2026Menu =
	| { name: string; title: string; groups: Nav2026Group[]; href?: undefined }
	| { name: string; title: string; href: string; groups?: undefined };
