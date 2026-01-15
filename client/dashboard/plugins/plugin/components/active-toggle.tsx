import { __, sprintf } from '@wordpress/i18n';
import FieldActionToggle from './field-action-toggle';
import type { SiteWithPluginData } from '../use-plugin';
import type { Dispatch, SetStateAction } from 'react';

type ActiveFieldProps = {
	item: SiteWithPluginData;
	plugin: { id?: string; name?: string } | null | undefined;
	// The current active value from the server for this plugin on this site.
	active: boolean;
	activateMutate: ( variables: { siteId: number; pluginId: string } ) => Promise< unknown >;
	deactivateMutate: ( variables: { siteId: number; pluginId: string } ) => Promise< unknown >;
	optimisticActive: Record< number, boolean | undefined >;
	setOptimisticActive: Dispatch< SetStateAction< Record< number, boolean | undefined > > >;
	disabled?: boolean;
};

export const ActiveToggle = ( {
	item,
	plugin,
	active,
	activateMutate,
	deactivateMutate,
	optimisticActive,
	setOptimisticActive,
	disabled = false,
}: ActiveFieldProps ) => {
	const serverChecked = active;
	const optimistic = optimisticActive[ item.ID ];

	// Use optimistic value if we have one, otherwise use server value
	const checked = optimistic ?? serverChecked;

	return (
		<FieldActionToggle
			label={ checked ? __( 'On' ) : __( 'Off' ) }
			checked={ checked }
			disabled={ disabled }
			onToggle={ ( next ) => {
				// what the toggle was before this click
				const previous = checked;

				setOptimisticActive( ( prev ) => ( {
					...prev,
					[ item.ID ]: next,
				} ) );

				const mutation = next
					? activateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } )
					: deactivateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );

				// Return the promise so FieldActionToggle can show notices
				return mutation.catch( ( error: unknown ) => {
					setOptimisticActive( ( prev ) => ( {
						...prev,
						[ item.ID ]: previous,
					} ) );

					// rethrow so FieldActionToggle shows error notice
					throw error;
				} );
			} }
			successOn={ sprintf(
				// translators: %s is the name of the plugin.
				__( '%s has been activated.' ),
				plugin?.name ?? ''
			) }
			errorOn={ sprintf(
				// translators: %s is the name of the plugin.
				__( 'Failed to activate %s.' ),
				plugin?.name ?? ''
			) }
			successOff={ sprintf(
				// translators: %s is the name of the plugin.
				__( '%s has been deactivated.' ),
				plugin?.name ?? ''
			) }
			errorOff={ sprintf(
				// translators: %s is the name of the plugin.
				__( 'Failed to deactivate %s.' ),
				plugin?.name ?? ''
			) }
			actionId="activate"
		/>
	);
};
