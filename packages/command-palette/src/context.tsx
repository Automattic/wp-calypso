import { SiteExcerptData } from '@automattic/sites';
import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { Command, CommandMenuGroupProps, useCommandsParams } from '.';

const CommandMenuGroupContext = createContext< CommandMenuGroupProps >( {
	currentSiteId: null,
	search: '',
	selectedCommandName: '',
	setSelectedCommandName: function ( name: string ): void {
		throw new Error( 'Function not implemented.' );
	},
	navigate: function ( path: string, openInNewTab?: boolean | undefined ): void {
		throw new Error( 'Function not implemented.' );
	},
	useCommands: function ( options: useCommandsParams ): Command[] {
		throw new Error( 'Function not implemented.' );
	},
	currentRoute: null,
	useSites: function (): SiteExcerptData[] {
		throw new Error( 'Function not implemented.' );
	},
	userCapabilities: {},
	close: function ( commandName?: string | undefined, isExecuted?: boolean | undefined ): void {
		throw new Error( 'Function not implemented.' );
	},
	setSearch: function ( search: string ): void {
		throw new Error( 'Function not implemented.' );
	},
	setPlaceholderOverride: function ( placeholder: string ): void {
		throw new Error( 'Function not implemented.' );
	},
} );

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
