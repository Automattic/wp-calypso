// 2026 nav taxonomy shape. A top-level entry is either a dropdown (has `groups`)
// or a direct link (has `href`).
export interface Nav2026Item {
	label: string;
	url: string;
	target?: string;
}

export interface Nav2026Group {
	title: string;
	items: Nav2026Item[];
}

export type Nav2026Menu =
	| { name: string; title: string; groups: Nav2026Group[]; href?: undefined }
	| { name: string; title: string; href: string; groups?: undefined };
