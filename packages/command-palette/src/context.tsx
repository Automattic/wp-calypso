import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { CommandCallBackParams } from './use-command-palette';
import { CommandPaletteProps } from '.';

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
