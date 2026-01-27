/**
 * Types for Calypso-native tools
 */

// Re-export core types from extension-types
export type { Ability, ToolProvider } from '../extension-types';

/**
 * Represents a selected WordPress site
 */
export interface SelectedSite {
	ID: number;
	name: string;
	URL: string;
	is_private?: boolean;
	capabilities?: Record< string, boolean >;
}

/**
 * Result from the site picker tool
 */
export interface SitePickerResult {
	success: boolean;
	site?: SelectedSite;
	cancelled?: boolean;
}

/**
 * Result from the navigate tool
 */
export interface NavigateResult {
	success: boolean;
	path: string;
}

/**
 * Arguments for the site picker tool
 */
export interface SitePickerArgs {
	prompt?: string;
}

/**
 * Arguments for the navigate tool
 */
export interface NavigateArgs {
	path: string;
}

/**
 * Options for showing the site picker
 */
export interface ShowSitePickerOptions {
	prompt?: string;
	onSelect: ( site: SelectedSite ) => void;
	onCancel: () => void;
}

/**
 * Actions available to Calypso tools that require React context
 */
export interface CalypsoToolActions {
	navigate: ( path: string ) => void;
	showSitePicker: ( options: ShowSitePickerOptions ) => void;
}
