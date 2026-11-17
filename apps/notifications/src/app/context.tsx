import { createContext, useContext, useMemo } from 'react';
import { recordTracksEvent } from '../panel/helpers/stats';
import type { Client, FilterName } from './types';

export type FullView = {
	filterName: FilterName;
	noteId?: string;
};

export type AppContextData = {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled: boolean;
	onOpenFullView?: ( view: FullView ) => void;
};

const AppContext = createContext< AppContextData >( {
	client: null,
	locale: 'en',
	isViewSettingsEnabled: false,
} );

export const AppProvider = ( {
	client,
	locale,
	isViewSettingsEnabled = false,
	onOpenFullView,
	children,
}: {
	client: Client | null;
	locale: string;
	isViewSettingsEnabled?: boolean;
	onOpenFullView?: ( view: FullView ) => void;
	children: React.ReactNode;
} ) => {
	const value = useMemo(
		() => ( {
			client,
			locale,
			isViewSettingsEnabled,
			onOpenFullView,
		} ),
		[ client, locale, isViewSettingsEnabled, onOpenFullView ]
	);

	return <AppContext.Provider value={ value }>{ children }</AppContext.Provider>;
};

export const useAppContext = () => useContext( AppContext );

/**
 * Returns a function that opens the host's full view on the given tab and note, or nothing when the host has no full view.
 */
export const useOpenFullView = ( { filterName, noteId }: FullView ) => {
	const { onOpenFullView } = useAppContext();

	if ( ! onOpenFullView ) {
		return undefined;
	}

	return () => {
		recordTracksEvent( 'calypso_notification_full_view_click', {
			tab: filterName,
			is_note_open: !! noteId,
		} );
		onOpenFullView( { filterName, noteId } );
	};
};
