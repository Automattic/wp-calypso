export interface SelectedDomain {
	uuid: string;
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
}

export interface DomainSearchCart {
	items: SelectedDomain[];
	total: string;
	onAddItem: ( item: SelectedDomain[ 'uuid' ] ) => void;
	onRemoveItem: ( item: SelectedDomain[ 'uuid' ] ) => void;
	hasItem: ( uuid: SelectedDomain[ 'uuid' ] ) => boolean;
}

export interface DomainSearchContextType {
	query: string;
	setQuery: ( query: string ) => void;
	onContinue: () => void;
	cart: DomainSearchCart;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
}
