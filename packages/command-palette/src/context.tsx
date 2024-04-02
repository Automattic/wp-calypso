import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { useCommandsParams } from './commands/types';
import { Command as PaletteCommand, CommandCallBackParams } from './use-command-palette';
import type { SiteExcerptData } from '@automattic/sites';

export interface CommandPaletteContext {
	currentRoute: string | null;
	currentSiteId: number | null;
	isOpenGlobal?: boolean;
	navigate: ( path: string, openInNewTab?: boolean ) => void;
	onClose?: () => void;
	useCommands: ( options: useCommandsParams ) => PaletteCommand[];
	userCapabilities?: { [ key: number ]: { [ key: string ]: boolean } };
	useSites?: () => SiteExcerptData[];
}

const CommandPaletteContext = createContext< CommandPaletteContext | undefined >( undefined );

export const CommandPaletteContextProvider: FC< PropsWithChildren< CommandPaletteContext > > = ( {
	children,
	currentRoute,
	currentSiteId,
	navigate,
	onClose,
	useCommands,
	userCapabilities,
	useSites,
} ) => {
	return (
		<CommandPaletteContext.Provider
			value={ {
				currentRoute,
				currentSiteId,
				navigate,
				onClose,
				useCommands,
				userCapabilities,
				useSites,
			} }
		>
			{ children }
		</CommandPaletteContext.Provider>
	);
};

export const useCommandPaletteContext = () => {
	const context = useContext( CommandPaletteContext );

	if ( ! context ) {
		throw new Error(
			'useCommandPaletteContext must be used within a CommandPaletteContextProvider'
		);
	}

	return context;
};

export interface CommandMenuGroupContext
	extends Pick< CommandCallBackParams, 'close' | 'setSearch' | 'setPlaceholderOverride' > {
	emptyListNotice: string;
	placeHolderOverride: string;
	search: string;
	selectedCommandName: string;
	setEmptyListNotice: ( message: string ) => void;
	setFooterMessage: ( message: string ) => void;
	setSelectedCommandName: ( name: string ) => void;
}

const CommandMenuGroupContext = createContext< CommandMenuGroupContext | undefined >( undefined );

export const CommandMenuGroupContextProvider: FC<
	PropsWithChildren< CommandMenuGroupContext >
> = ( {
	children,
	close,
	emptyListNotice,
	placeHolderOverride,
	search,
	selectedCommandName,
	setEmptyListNotice,
	setFooterMessage,
	setPlaceholderOverride,
	setSearch,
	setSelectedCommandName,
} ) => {
	return (
		<CommandMenuGroupContext.Provider
			value={ {
				close,
				emptyListNotice,
				placeHolderOverride,
				search,
				selectedCommandName,
				setEmptyListNotice,
				setFooterMessage,
				setPlaceholderOverride,
				setSearch,
				setSelectedCommandName,
			} }
		>
			{ children }
		</CommandMenuGroupContext.Provider>
	);
};

export const useCommandMenuGroupContext = () => {
	const context = useContext( CommandMenuGroupContext );

	if ( ! context ) {
		throw new Error(
			'useCommandMenuGroupContext must be used within a CommandMenuGroupContextProvider'
		);
	}

	return context;
};
