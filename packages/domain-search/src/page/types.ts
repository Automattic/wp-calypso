import { DomainSuggestion } from '../components/search-results/queries';

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
	onAddItem: ( item: DomainSuggestion ) => Promise< unknown >;
	onRemoveItem: ( item: SelectedDomain[ 'uuid' ] ) => Promise< unknown >;
	hasItem: ( uuid: SelectedDomain[ 'uuid' ] ) => boolean;
}

export interface DomainSearchEvents {
	onContinue: () => void;
}

export interface DomainSearchProps {
	cart: DomainSearchCart;
	className?: string;
	initialQuery?: string;
	events?: Partial< DomainSearchEvents >;
}
