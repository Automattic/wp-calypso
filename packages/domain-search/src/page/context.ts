import {
	domainAvailabilityQuery,
	domainSuggestionsQuery,
	freeSuggestionQuery,
} from '@automattic/api-queries';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { DomainSearchProps, DomainSearchContextType } from './types';

const noop = () => {};

export const DEFAULT_CONTEXT_VALUE: DomainSearchContextType = {
	events: {
		onContinue: noop,
		onSkip: noop,
		onMakePrimaryAddressClick: noop,
		onMoveDomainToSiteClick: noop,
		onTransferDomainToWordPressComClick: noop,
		onRegisterDomainClick: noop,
		onCheckTransferStatusClick: noop,
		onMapDomainClick: noop,
	},
	queries: {
		domainSuggestions: ( query: string ) => domainSuggestionsQuery( query ),
		domainAvailability: ( domainName: string ) => domainAvailabilityQuery( domainName ),
		freeSuggestion: ( query: string ) => freeSuggestionQuery( query ),
	},
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
	query: '',
	setQuery: () => {},
	config: {
		vendor: 'variation2_front',
		skippable: false,
		deemphasizedTlds: [],
	},
};

export const DomainSearchContext =
	createContext< DomainSearchContextType >( DEFAULT_CONTEXT_VALUE );

export const useDomainSearch = () => {
	const context = useContext( DomainSearchContext );

	if ( context === DEFAULT_CONTEXT_VALUE ) {
		throw new Error( 'useDomainSearch must be used within a DomainSearchContext' );
	}

	return context;
};

export const useDomainSearchContextValue = (
	props: DomainSearchProps
): typeof DEFAULT_CONTEXT_VALUE => {
	const { currentSiteUrl, initialQuery, cart, events, slots, config } = props;

	const [ isFullCartOpen, setIsFullCartOpen ] = useState( false );
	const [ query, setQuery ] = useState( initialQuery ?? '' );

	const closeFullCart = useCallback( () => {
		setIsFullCartOpen( false );
	}, [] );

	const openFullCart = useCallback( () => {
		setIsFullCartOpen( true );
	}, [] );

	const normalizedEvents = useMemo( () => {
		return {
			...DEFAULT_CONTEXT_VALUE.events,
			...events,
		};
	}, [ events ] );

	const normalizedConfig = useMemo( () => {
		return {
			...DEFAULT_CONTEXT_VALUE.config,
			...config,
		};
	}, [ config ] );

	return useMemo( () => {
		return {
			events: normalizedEvents,
			config: normalizedConfig,
			queries: {
				domainSuggestions: ( query ) => ( {
					...domainSuggestionsQuery( query, {
						quantity: 30,
						vendor: normalizedConfig.vendor,
					} ),
					enabled: false,
				} ),
				freeSuggestion: ( query ) => ( {
					...freeSuggestionQuery( query ),
					enabled: normalizedConfig.skippable,
				} ),
				domainAvailability: ( domainName ) => ( {
					...domainAvailabilityQuery( domainName ),
					enabled: false,
				} ),
			},
			cart,
			isFullCartOpen,
			closeFullCart,
			openFullCart,
			query,
			setQuery,
			slots,
			currentSiteUrl,
		};
	}, [
		isFullCartOpen,
		closeFullCart,
		openFullCart,
		query,
		setQuery,
		cart,
		normalizedEvents,
		slots,
		currentSiteUrl,
		normalizedConfig,
	] );
};
