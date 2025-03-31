/**
 * Temporary `type declarations for `@wordpress/commands`
 * @todo Remove this once the types are added to the core package
 */
declare module '@wordpress/commands' {
	import { StoreDescriptor } from '@wordpress/data';

	export interface WPCommand {
		name: string;
		label: string;
		searchLabel?: string;
		callback: () => void;
		icon?: React.ReactElement | string;
		context?: string;
	}

	export interface CommandsActions {
		registerCommand: ( command: WPCommand ) => void;
		unregisterCommand: ( commandName: string ) => void;
		open: () => void;
		close: () => void;
	}

	export interface CommandsSelectors {
		getCommands: () => WPCommand[];
	}

	export interface CommandsStoreConfig {
		reducer: ( state: CommandsState | undefined, action: any ) => CommandsState;
		actions: CommandsActions;
		selectors: CommandsSelectors;
	}

	export const store: StoreDescriptor< CommandsStoreConfig >;

	export function useCommand( command: WPCommand ): void;
}
