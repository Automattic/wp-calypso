import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import clsx from 'clsx';
import { useLayoutEffect } from 'react';
import { DomainSearchContext, useDomainSearchContextValue } from './context';
import { EmptyPage } from './empty';
import { ResultsPage } from './results';
import type { DomainSearchProps } from './types';

import './style.scss';

export const DomainSearch = ( props: DomainSearchProps ) => {
	const contextValue = useDomainSearchContextValue( props );

	const cartItemsLength = contextValue.cart.items.length;
	const isFullCartOpen = contextValue.isFullCartOpen;
	const closeFullCart = contextValue.closeFullCart;

	useLayoutEffect( () => {
		if ( cartItemsLength === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ cartItemsLength, isFullCartOpen, closeFullCart ] );

	const getContent = () => {
		if ( ! contextValue.query ) {
			return <EmptyPage />;
		}

		return <ResultsPage />;
	};

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider value={ contextValue }>
				<div className={ clsx( 'domain-search', props.className ) }>{ getContent() }</div>
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};
