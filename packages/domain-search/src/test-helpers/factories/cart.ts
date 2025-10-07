import { DomainSearchCart } from '../../page/types';

export const buildCart = ( overrides: Partial< DomainSearchCart > = {} ): DomainSearchCart => {
	return {
		items: [],
		total: '',
		onAddItem: jest.fn(),
		onRemoveItem: jest.fn(),
		hasItem: jest.fn(),
		...overrides,
	};
};
