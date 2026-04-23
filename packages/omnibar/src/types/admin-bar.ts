export interface AdminBarNode {
	id: string;
	title: string | false;
	parent: string | false;
	href: string;
	group: boolean;
	meta?: {
		menu_title?: string;
	};
}
