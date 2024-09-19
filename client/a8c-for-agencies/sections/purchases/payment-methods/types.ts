export interface StoredCardPaging {
	startingAfter: string;
	endingBefore: string;
}
export interface PaymentMethodOverviewContext {
	paging?: StoredCardPaging;
	setPaging: ( paging: { startingAfter: string; endingBefore: string } ) => void;
}
