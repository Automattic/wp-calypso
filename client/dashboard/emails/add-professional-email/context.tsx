import { createContext, useContext } from 'react';

const DEFAULT_CONTEXT_VALUE = {
	cart: {
		items: [],
		total: '',
		hasItem: () => false,
		onAddItem: () => Promise.resolve(),
		onRemoveItem: () => Promise.resolve(),
	},
	isFullCartOpen: false,
	closeFullCart: () => {},
	openFullCart: () => {},
};

export const AddMailboxesContext = createContext( DEFAULT_CONTEXT_VALUE );

export const useAddMailboxesContext = () => {
	const context = useContext( AddMailboxesContext );

	return context;
};
