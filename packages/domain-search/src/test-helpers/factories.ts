import {
	DomainSearchContextType,
	DomainSearchCart,
	SelectedDomain,
} from '../components/domain-search';

export const buildDomainSearchCart = (
	overrides: Partial< DomainSearchCart > = {}
): DomainSearchCart => ( {
	items: [],
	total: '$0',
	onAddItem: () => {},
	onRemoveItem: () => {},
	...overrides,
} );

export const buildDomainSearchContext = (
	overrides: Partial< DomainSearchContextType > = {}
): DomainSearchContextType => ( {
	isFullCartOpen: false,
	closeFullCart: () => {},
	onContinue: () => {},
	query: '',
	setQuery: () => {},
	cart: buildDomainSearchCart(),
	openFullCart: () => {},
	...overrides,
} );

export const buildDomain = ( overrides: Partial< SelectedDomain > = {} ): SelectedDomain => ( {
	uuid: '1',
	domain: 'example',
	tld: 'com',
	price: '$10',
	...overrides,
} );
