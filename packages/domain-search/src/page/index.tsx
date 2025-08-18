import { __experimentalVStack as VStack } from '@wordpress/components';
import clsx from 'clsx';
import { useCallback, useState, useMemo, useLayoutEffect } from 'react';
import { Cart } from '../components/cart';
import { SearchBar } from '../components/search-bar';
import { SearchForm } from '../components/search-form';
import { SearchResults } from '../components/search-results';
import { domainSuggestionsQuery } from '../queries/suggestions';
import { DEFAULT_CONTEXT_VALUE, DomainSearchContext } from './context';
import type { DomainSearchProps } from './types';

import './style.scss';

export const DomainSearch = ( { className, initialQuery, cart, events }: DomainSearchProps ) => {
	const [ isFullCartOpen, setIsFullCartOpen ] = useState( false );
	const [ query, setQuery ] = useState( initialQuery ?? '' );

	const closeFullCart = useCallback( () => {
		setIsFullCartOpen( false );
	}, [] );

	const openFullCart = useCallback( () => {
		setIsFullCartOpen( true );
	}, [] );

	const contextValue = useMemo(
		() => ( {
			events: {
				...DEFAULT_CONTEXT_VALUE.events,
				...events,
			},
			queries: {
				domainSuggestions: domainSuggestionsQuery,
			},
			cart,
			isFullCartOpen,
			closeFullCart,
			openFullCart,
			query,
			setQuery,
		} ),
		[ isFullCartOpen, closeFullCart, openFullCart, query, setQuery, cart, events ]
	);

	const cartItemsLength = cart.items.length;

	useLayoutEffect( () => {
		if ( cartItemsLength === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ cartItemsLength, isFullCartOpen, closeFullCart ] );

	const getContent = () => {
		if ( ! query ) {
			return <SearchForm />;
		}
		return (
			<VStack spacing={ 8 }>
				<SearchBar />
				<SearchResults />
				<Cart />
			</VStack>
		);
	};

	return (
		<DomainSearchContext.Provider value={ contextValue }>
			<div className={ clsx( 'domain-search', className ) }>{ getContent() }</div>
		</DomainSearchContext.Provider>
	);
};
