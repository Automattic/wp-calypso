import { FC, PropsWithChildren, createContext, useContext } from 'react';
import type { CommandPaletteProps } from './';
import type { CommandCallBackParams } from './commands';

export interface CommandPaletteContext
	extends Pick<
			CommandPaletteProps,
			| 'currentRoute'
			| 'currentSiteId'
			| 'navigate'
			| 'useCommands'
			| 'useSites'
			| 'userCapabilities'
		>,
		Pick< CommandCallBackParams, 'close' | 'setSearch' | 'setPlaceholderOverride' > {
	emptyListNotice: string;
	isOpen: boolean;
	placeHolderOverride: string;
	search: string;
	selectedCommandName: string;
	setEmptyListNotice: ( message: string ) => void;
	setFooterMessage: ( message: string | JSX.Element ) => void;
	setSelectedCommandName: ( name: string ) => void;
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
	isOpen,
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
				isOpen,
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
