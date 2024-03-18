import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { CommandMenuGroupProps } from '.';

const CommandMenuGroupContext = createContext< CommandMenuGroupProps | undefined >( undefined );

export const CommandMenuGroupContextProvider: FC< PropsWithChildren< CommandMenuGroupProps > > = ( {
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

export const useCommandMenuGroupContext = (): CommandMenuGroupProps => {
	const context = useContext( CommandMenuGroupContext );

	if ( ! context ) {
		throw new Error(
			'useCommandMenuGroupContext must be used within a CommandMenuGroupContextProvider'
		);
	}

	return context;
};
