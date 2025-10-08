import type { DomainSearchCart, SelectedDomain } from '../../page/types';

export const buildCart = ( overrides: Partial< DomainSearchCart > = {} ): DomainSearchCart => {
	return {
		items: [],
		total: '$0',
		onAddItem: jest.fn(),
		onRemoveItem: jest.fn(),
		hasItem: jest.fn(),
		...overrides,
	};
};

export const buildCartItem = ( overrides: Partial< SelectedDomain > = {} ): SelectedDomain => {
	return {
		uuid: overrides.uuid ?? '123',
		domain: overrides.domain ?? 'test.com',
		tld: overrides.tld ?? 'com',
		price: overrides.price ?? '$100',
		salePrice: overrides.salePrice ?? '$90',
		...overrides,
	};
};
