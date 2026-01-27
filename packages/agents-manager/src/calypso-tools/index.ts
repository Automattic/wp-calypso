/**
 * Calypso Tools
 *
 * Native Calypso tools that integrate directly with the agents-manager package.
 * These tools don't require external providers like Big Sky.
 */

import { useMemo } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { navigateAbility, executeNavigate } from './navigate';
import { sitePickerAbility, executeSitePicker, useSitePicker } from './site-picker';
import type { ToolProvider, Ability, CalypsoToolActions, ShowSitePickerOptions } from './types';

// Re-export components and types
export { SitePickerModal } from './site-picker';
export type {
	ToolProvider,
	Ability,
	SelectedSite,
	SitePickerResult,
	NavigateResult,
	CalypsoToolActions,
	ShowSitePickerOptions,
} from './types';

/**
 * List of all Calypso abilities
 */
const CALYPSO_ABILITIES: Ability[] = [ navigateAbility, sitePickerAbility ];

/**
 * Hook that provides Calypso tools with access to React context
 *
 * This hook must be used within a react-router-dom Router context.
 *
 * @returns Tool provider and modal component
 */
export function useCalypsoTools(): {
	toolProvider: ToolProvider;
	SitePickerModalComponent: React.FC;
} {
	const navigate = useNavigate();
	const { SitePickerModalComponent, showSitePicker } = useSitePicker();

	// Create actions object with access to React context
	const actions: CalypsoToolActions = useMemo(
		() => ( {
			navigate: ( path: string ) => {
				// Navigate using Calypso's router (for agent dock internal routes)
				// or using window.location for full Calypso routes
				if ( path.startsWith( '/chat' ) || path.startsWith( '/history' ) ) {
					navigate( path );
				} else {
					// For Calypso routes, use window.location to trigger full navigation
					window.location.href = path;
				}
			},
			showSitePicker,
		} ),
		[ navigate, showSitePicker ]
	);

	// Create tool provider
	const toolProvider: ToolProvider = useMemo(
		() => ( {
			getAbilities: async () => CALYPSO_ABILITIES,
			executeAbility: async ( name: string, args: unknown ) => {
				// Backend translates slashes/hyphens to underscores when calling tools
				// e.g., 'calypso/show-site-picker' becomes 'calypso__show_site_picker'
				// Normalize the name to handle both formats
				const normalizedName = name.replace( /__/g, '/' ).replace( /_/g, '-' );

				// eslint-disable-next-line no-console
				console.log( '[CalypsoTools] executeAbility called:', { name, normalizedName, args } );

				switch ( normalizedName ) {
					case 'calypso/navigate':
						return executeNavigate( args as { path: string }, actions );

					case 'calypso/show-site-picker': {
						const result = await executeSitePicker(
							args as { prompt?: string },
							actions.showSitePicker as ( options: ShowSitePickerOptions ) => void
						);
						// eslint-disable-next-line no-console
						console.log( '[CalypsoTools] Site picker result:', result );
						return result;
					}

					default:
						throw new Error( `Unknown Calypso ability: ${ name }` );
				}
			},
		} ),
		[ actions ]
	);

	return {
		toolProvider,
		SitePickerModalComponent,
	};
}

/**
 * Merge multiple tool providers into one
 *
 * Calypso tools take precedence (are listed first in abilities)
 * but external tools are executed if the ability name doesn't match Calypso tools.
 */
export function mergeToolProviders(
	calypsoProvider: ToolProvider,
	externalProvider?: ToolProvider
): ToolProvider {
	return {
		getAbilities: async () => {
			const calypsoAbilities = await calypsoProvider.getAbilities();

			if ( ! externalProvider ) {
				return calypsoAbilities;
			}

			const externalAbilities = await externalProvider.getAbilities();

			// Combine abilities, with Calypso tools first
			// Filter out any external abilities that conflict with Calypso names
			const calypsoNames = new Set( calypsoAbilities.map( ( a ) => a.name ) );
			const filteredExternal = externalAbilities.filter( ( a ) => ! calypsoNames.has( a.name ) );

			return [ ...calypsoAbilities, ...filteredExternal ];
		},
		executeAbility: async ( name: string, args: unknown ) => {
			// Check if this is a Calypso ability
			// Backend may use underscore format (calypso__navigate) or slash format (calypso/navigate)
			if ( name.startsWith( 'calypso/' ) || name.startsWith( 'calypso__' ) ) {
				return calypsoProvider.executeAbility( name, args );
			}

			// Otherwise, delegate to external provider
			if ( externalProvider ) {
				return externalProvider.executeAbility( name, args );
			}

			throw new Error( `No provider found for ability: ${ name }` );
		},
	};
}
