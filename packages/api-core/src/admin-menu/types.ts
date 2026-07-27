export interface AdminMenuItem {
	slug: string;
	title: string;
	type: string;
	url?: string;
	icon?: string;
	badge?: string;
	count?: number;
	parent?: string;
	children?: AdminMenuItem[];
}

export type AdminMenuResponse = AdminMenuItem[] | { menu: AdminMenuItem[] };
