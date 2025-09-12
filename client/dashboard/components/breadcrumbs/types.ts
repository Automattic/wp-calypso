export interface BreadcrumbItem {
	label: string;
	to: string;
	params: Record< string, string >;
}

export interface BreadcrumbsProps {
	items: BreadcrumbItem[];
}
