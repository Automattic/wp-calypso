import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { useCommandsParams } from './commands/types';
import { Command as PaletteCommand, CommandCallBackParams } from './use-command-palette';
import type { SiteExcerptData } from '@automattic/sites';

export interface CommandMenuGroupContext
	extends Pick< CommandCallBackParams, 'close' | 'setSearch' | 'setPlaceholderOverride' > {
	currentSiteId: number | null;
	search: string;
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
	setFooterMessage?: ( message: string ) => void;
	setEmptyListNotice?: ( message: string ) => void;
	navigate: ( path: string, openInNewTab?: boolean ) => void;
	useCommands: ( options: useCommandsParams ) => PaletteCommand[];
	currentRoute: string | null;
	useSites: () => SiteExcerptData[];
	userCapabilities: { [ key: number ]: { [ key: string ]: boolean } };
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
