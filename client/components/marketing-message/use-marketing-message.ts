import { useLocale } from '@automattic/i18n-utils';
import { useCallback, useEffect, useState } from 'react';
import store from 'store';
import wpcom from 'calypso/lib/wp';
import { MESSAGE_STORAGE_KEY, MINUTE_IN_MS } from './constants';
import { getDismissList, addDismissId } from './dismiss-list';

export type MarketingMessage = {
	id: string;
	text: string;
};

type CachedMessage = {
	valid_until: string;
	locale: string;
	messages: MarketingMessage[];
	hidden?: boolean;
};

type ReturnMessage = [
	isFetching: boolean,
	messages: MarketingMessage[],
	removeMessage: ( id: string ) => void,
];

const mockData: MarketingMessage[] = [];

function getStorageKey( siteId: number | null ) {
	return siteId ? `${ MESSAGE_STORAGE_KEY }_${ siteId }` : MESSAGE_STORAGE_KEY;
}

async function getCachedMarketingMessage( locale: string, siteId: number | null ) {
	const storageKey = getStorageKey( siteId );
	const cached: CachedMessage | null = store.get( storageKey );
	const dismissed = getDismissList( siteId );
	let validUntil = Date.parse( cached?.valid_until || '' ) || 0;
	let messages: MarketingMessage[] = [];

	if ( cached?.locale === locale && validUntil > Date.now() ) {
		return cached.messages.filter( ( msg ) => ! dismissed.includes( msg.id ) );
	}

	try {
		const path = siteId ? `/marketing/messages/${ siteId }/` : '/marketing/messages/';
		const response = ( await wpcom.req.get( { path } ) ) as CachedMessage;
		validUntil = Date.parse( response.valid_until );
		messages = response.messages.filter( ( msg ) => ! dismissed.includes( msg.id ) );
	} catch {
		validUntil = Date.now() + 30 * MINUTE_IN_MS;
	}

	store.set( storageKey, { valid_until: validUntil, locale, messages } );

	return messages;
}

export function useMarketingMessage( siteId: number | null, useMockData = false ): ReturnMessage {
	const locale = useLocale();
	const [ items, setItems ] = useState< MarketingMessage[] >( [] );
	const [ isFetching, setIsFetching ] = useState( false );

	useEffect( () => {
		if ( useMockData ) {
			setItems( mockData );
			return;
		}

		setIsFetching( true );
		getCachedMarketingMessage( locale, siteId )
			.then( ( messages ) => setItems( messages ) )
			.finally( () => setIsFetching( false ) );
	}, [ useMockData, siteId, locale ] );

	const removeMessage = useCallback(
		( id: string ) => {
			addDismissId( id, siteId );
			setItems( ( prev ) => prev.filter( ( msg ) => msg.id !== id ) );
		},
		[ siteId, setItems ]
	);

	return [ isFetching, items, removeMessage ];
}
