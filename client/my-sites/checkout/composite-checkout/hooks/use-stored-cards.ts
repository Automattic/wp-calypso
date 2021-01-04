/**
 * External dependencies
 */
import { useReducer, useEffect } from 'react';
import debugFactory from 'debug';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import type { StoredCard } from '../types/stored-cards';

const debug = debugFactory( 'calypso:composite-checkout:use-stored-cards' );

export interface StoredCardState {
	storedCards: StoredCard[];
	isLoading: boolean;
	error: string | TranslateResult | null;
}

type StoredCardAction =
	| { type: 'FETCH_END'; payload: StoredCard[] }
	| { type: 'FETCH_ERROR'; payload: string | TranslateResult };

export default function useStoredCards(
	getStoredCards: () => StoredCard[],
	isLoggedOutCart: boolean
): StoredCardState {
	const [ state, dispatch ] = useReducer( storedCardsReducer, {
		storedCards: [],
		isLoading: true,
		error: null,
	} );
	const translate = useTranslate();

	useEffect( () => {
		if ( isLoggedOutCart ) {
			return;
		}
		let isSubscribed = true;
		async function fetchStoredCards() {
			debug( 'fetching stored cards' );
			return getStoredCards();
		}

		fetchStoredCards()
			.then( ( cards ) => {
				if ( ! Array.isArray( cards ) ) {
					const payload = translate( 'There was a problem loading your stored cards.' );
					debug( 'stored cards response is not an array', cards );
					isSubscribed && dispatch( { type: 'FETCH_ERROR', payload } );
					return;
				}
				debug( 'stored cards fetched', cards );
				isSubscribed && dispatch( { type: 'FETCH_END', payload: cards } );
			} )
			.catch( ( error ) => {
				debug( 'stored cards failed to load', error );
				isSubscribed && dispatch( { type: 'FETCH_ERROR', payload: error.message } );
			} );

		return () => {
			isSubscribed = false;
		};
	}, [ getStoredCards, isLoggedOutCart ] );

	if ( isLoggedOutCart ) {
		return { ...state, isLoading: false };
	}

	return state;
}

function storedCardsReducer( state: StoredCardState, action: StoredCardAction ) {
	switch ( action.type ) {
		case 'FETCH_END':
			return { ...state, storedCards: action.payload, isLoading: false };
		case 'FETCH_ERROR':
			return { ...state, storedCards: [], error: action.payload, isLoading: false };
		default:
			return state;
	}
}
