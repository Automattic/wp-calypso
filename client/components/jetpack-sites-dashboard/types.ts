export interface DataViewsField {
	id: string;
	header: string;
	enableHiding: boolean;
	enableSorting: boolean;
}

export interface DataViewsPaginationInfo {
	totalItems: number;
	totalPages: number;
}
