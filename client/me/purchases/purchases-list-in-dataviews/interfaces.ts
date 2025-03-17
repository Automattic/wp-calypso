export interface PurchasesDataResponse {
	purchases: Array< object >;
	total: number;
	perPage: number;
}

export interface PurchasesDataViewsProps {
	className?: string;
	data: PurchasesDataResponse | undefined;
	isLoading: boolean;
}
