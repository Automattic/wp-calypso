export interface SelectedDomain {
	uuid: string;
	domain: string;
	tld: string;
	salePrice?: string;
	price: string;
}

export interface DomainSearchCart {
	items: SelectedDomain[];
	total: string;
	onAddItem: ( item: SelectedDomain[ 'uuid' ] ) => Promise< void >;
	onRemoveItem: ( item: SelectedDomain[ 'uuid' ] ) => Promise< void >;
	hasItem: ( uuid: SelectedDomain[ 'uuid' ] ) => boolean;
}

export interface DomainSearchProps {
	initialQuery?: string;
	cart: DomainSearchCart;
}
