import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { getTld } from '../helpers';
import { useSuggestionsList } from '../hooks/use-suggestions-list';
import { DomainSearchContext, useDomainSearchContextValue } from '../page/context';
import { buildCart, buildCartItem } from './factories/cart';
import type { DomainSearchProps, SelectedDomain } from '../page/types';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			retry: false,
			gcTime: 0,
		},
	},
} );

export const TestDomainSearch = ( {
	cart = buildCart(),
	...props
}: Partial< DomainSearchProps > & { children: React.ReactNode } ) => {
	const contextValue = useDomainSearchContextValue( { cart, ...props } );

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider value={ contextValue }>
				{ props.children }
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

export const TestDomainSearchWithCart = ( {
	initialCartItems = [],
	children,
	operationPromise,
	...props
}: {
	initialCartItems?: SelectedDomain[];
	children: React.ReactNode;
	operationPromise?: Promise< unknown >;
} & Omit< DomainSearchProps, 'cart' > ) => {
	const [ items, setItems ] = useState( initialCartItems );

	const total = items.reduce( ( acc, item ) => {
		const price = item.salePrice ?? item.price;

		return acc + parseInt( price.replace( '$', '' ) );
	}, 0 );

	return (
		<TestDomainSearch
			{ ...props }
			cart={ buildCart( {
				items,
				total: `$${ total }`,
				hasItem: ( domainName ) =>
					items.some( ( item ) => `${ item.domain }.${ item.tld }` === domainName ),
				onAddItem: async ( item ) => {
					if ( operationPromise ) {
						try {
							await operationPromise;
						} catch ( error ) {
							return Promise.reject( error );
						}
					}

					setTimeout( () => {
						const tld = getTld( item.domain_name );

						setItems( [
							...items,
							buildCartItem( {
								uuid: crypto.randomUUID(),
								domain: item.domain_name.replace( `.${ tld }`, '' ),
								tld,
								price: item.cost,
								salePrice: item.sale_cost ? `$${ item.sale_cost }` : undefined,
							} ),
						] );
					}, 0 );

					return Promise.resolve();
				},
				onRemoveItem: async ( uuid ) => {
					if ( operationPromise ) {
						try {
							await operationPromise;
						} catch ( error ) {
							return Promise.reject( error );
						}
					}

					setTimeout( () => {
						setItems( items.filter( ( item ) => item.uuid !== uuid ) );
					}, 0 );

					return Promise.resolve();
				},
			} ) }
		>
			{ children }
		</TestDomainSearch>
	);
};

export const TestDomainSearchWithSuggestions: typeof TestDomainSearchWithCart = ( props ) => {
	const Content = () => {
		const { isLoading } = useSuggestionsList();

		return isLoading ? 'LOADING_TEST_CONTENT' : props.children;
	};

	return (
		<TestDomainSearchWithCart { ...props }>
			<Content />
		</TestDomainSearchWithCart>
	);
};
