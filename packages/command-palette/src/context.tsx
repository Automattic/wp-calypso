import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { useCommandsParams } from './commands/types';
import { Command as PaletteCommand, CommandCallBackParams } from './use-command-palette';
import { CommandPaletteProps } from '.';
import type { SiteExcerptData } from '@automattic/sites';

export interface CommandPaletteContext {
	currentRoute: string | null;
	currentSiteId: number | null;
	isOpenGlobal?: boolean;
	navigate: ( path: string, openInNewTab?: boolean ) => void;
	onClose?: () => void;
	useCommands: ( options: useCommandsParams ) => PaletteCommand[];
	userCapabilities: { [ key: number ]: { [ key: string ]: boolean } };
	useSites?: () => SiteExcerptData[];
}

const CommandPaletteContext = createContext< CommandPaletteContext | undefined >( undefined );

export const CommandPaletteContextProvider: FC< PropsWithChildren< CommandPaletteContext > > = ( {
	children,
	currentRoute,
	currentSiteId,
	navigate,
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
				useCommands,
				userCapabilities,
				useSites,
			} }
		>
			{ children }
		</CommandPaletteContext.Provider>
	);
};

export interface CommandMenuGroupContext
	extends Pick< CommandCallBackParams, 'close' | 'setSearch' | 'setPlaceholderOverride' >,
		Pick<
			CommandPaletteProps,
			| 'currentRoute'
			| 'currentSiteId'
			| 'navigate'
			| 'useCommands'
			| 'useSites'
			| 'userCapabilities'
		> {
	search: string;
	selectedCommandName: string;
	setEmptyListNotice?: ( message: string ) => void;
	setFooterMessage?: ( message: string ) => void;
	setSelectedCommandName: ( name: string ) => void;
}

const CommandMenuGroupContext = createContext< CommandMenuGroupContext | undefined >( undefined );

export const CommandMenuGroupContextProvider: FC<
	PropsWithChildren< CommandMenuGroupContext >
> = ( {
	children,
	close,
	currentRoute,
	currentSiteId,
	navigate,
	search,
	selectedCommandName,
	setEmptyListNotice,
	setFooterMessage,
	setPlaceholderOverride,
	setSearch,
	setSelectedCommandName,
	useCommands,
	userCapabilities,
	useSites,
} ) => {
	return (
		<CommandMenuGroupContext.Provider
			value={ {
				close,
				currentRoute,
				currentSiteId,
				navigate,
				search,
				selectedCommandName,
				setEmptyListNotice,
				setFooterMessage,
				setPlaceholderOverride,
				setSearch,
				setSelectedCommandName,
				useCommands,
				userCapabilities,
				useSites,
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
