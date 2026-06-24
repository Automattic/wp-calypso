// 2026 nav taxonomy. A top-level entry is a dropdown (`groups`) or a link (`href`).
export interface Nav2026Item {
	label: string;
	url: string;
	target?: string;
	badge?: string;
}

export interface Nav2026Group {
	title: string;
	items: Nav2026Item[];
}

export type Nav2026Menu =
	| { name: string; title: string; groups: Nav2026Group[]; href?: undefined }
	| { name: string; title: string; href: string; groups?: undefined };
