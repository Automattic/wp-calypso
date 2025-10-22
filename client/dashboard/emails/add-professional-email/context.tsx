import { createContext, useCallback, useContext, useMemo, useState } from 'react';

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

export const useAddMailboxesContextValue = ( { cart } ): typeof DEFAULT_CONTEXT_VALUE => {
	const [ isFullCartOpen, setIsFullCartOpen ] = useState( false );

	const closeFullCart = useCallback( () => {
		setIsFullCartOpen( false );
	}, [] );

	const openFullCart = useCallback( () => {
		setIsFullCartOpen( true );
	}, [] );

	return useMemo( () => {
		return {
			...DEFAULT_CONTEXT_VALUE,
			cart,
			isFullCartOpen,
			closeFullCart,
			openFullCart,
		};
	}, [ isFullCartOpen, closeFullCart, openFullCart, cart ] );
};
