import { DomainSuggestion } from '../queries/suggestions';

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
	hasItem: ( domain: SelectedDomain[ 'domain' ] ) => boolean;
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
