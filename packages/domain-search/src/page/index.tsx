import clsx from 'clsx';
import { useCallback, useState, useMemo, useLayoutEffect } from 'react';
import { domainAvailabilityQuery } from '../queries/availability';
import { productsQuery } from '../queries/products';
import { domainSuggestionsQuery } from '../queries/suggestions';
import { DEFAULT_CONTEXT_VALUE, DomainSearchContext } from './context';
import { EmptyPage } from './empty';
import { ResultsPage } from './results';
import type { DomainSearchProps } from './types';

import './style.scss';

export const DomainSearch = ( {
	className,
	currentSiteUrl,
	initialQuery,
	cart,
	events,
	slots,
}: DomainSearchProps ) => {
	const [ isFullCartOpen, setIsFullCartOpen ] = useState( false );
	const [ query, setQuery ] = useState( initialQuery ?? '' );

	const closeFullCart = useCallback( () => {
		setIsFullCartOpen( false );
	}, [] );

	const openFullCart = useCallback( () => {
		setIsFullCartOpen( true );
	}, [] );

	const contextValue: typeof DEFAULT_CONTEXT_VALUE = useMemo(
		() => ( {
			events: {
				...DEFAULT_CONTEXT_VALUE.events,
				...events,
			},
			queries: {
				domainSuggestions: domainSuggestionsQuery,
				domainAvailability: domainAvailabilityQuery,
				products: productsQuery,
			},
			cart,
			isFullCartOpen,
			closeFullCart,
			openFullCart,
			query,
			setQuery,
			slots,
			currentSiteUrl,
		} ),
		[
			isFullCartOpen,
			closeFullCart,
			openFullCart,
			query,
			setQuery,
			cart,
			events,
			slots,
			currentSiteUrl,
		]
	);

	const cartItemsLength = cart.items.length;

	useLayoutEffect( () => {
		if ( cartItemsLength === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ cartItemsLength, isFullCartOpen, closeFullCart ] );

	const getContent = () => {
		if ( ! query ) {
			return <EmptyPage />;
		}

		return <ResultsPage />;
	};

	return (
		<DomainSearchContext.Provider value={ contextValue }>
			<div className={ clsx( 'domain-search', className ) }>{ getContent() }</div>
		</DomainSearchContext.Provider>
	);
};
