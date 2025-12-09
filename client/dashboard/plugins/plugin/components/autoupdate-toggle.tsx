import { __, sprintf } from '@wordpress/i18n';
import FieldActionToggle from './field-action-toggle';
import type { SiteWithPluginData } from '../use-plugin';
import type { Dispatch, SetStateAction } from 'react';

type AutoupdateFieldProps = {
	item: SiteWithPluginData;
	plugin: { id?: string; name?: string } | null | undefined;
	autoupdate: boolean;
	enableAutoupdateMutate: ( variables: { siteId: number; pluginId: string } ) => Promise< unknown >;
	disableAutoupdateMutate: ( variables: {
		siteId: number;
		pluginId: string;
	} ) => Promise< unknown >;
	optimisticAutoupdate: Record< number, boolean | undefined >;
	setOptimisticAutoupdate: Dispatch< SetStateAction< Record< number, boolean | undefined > > >;
	disabled?: boolean;
};

export const AutoupdateToggle = ( {
	item,
	plugin,
	autoupdate,
	enableAutoupdateMutate,
	disableAutoupdateMutate,
	optimisticAutoupdate,
	setOptimisticAutoupdate,
	disabled,
}: AutoupdateFieldProps ) => {
	const serverChecked = autoupdate;
	const optimistic = optimisticAutoupdate[ item.ID ];

	// Use optimistic value if we have one, otherwise use server value
	const checked = optimistic ?? serverChecked;

	return (
		<FieldActionToggle
			label={ __( 'Autoupdate' ) }
			checked={ checked }
			disabled={ disabled }
			onToggle={ ( next ) => {
				// what the toggle was before this click
				const previous = checked;

				setOptimisticAutoupdate( ( prev ) => ( {
					...prev,
					[ item.ID ]: next,
				} ) );

				const mutation = next
					? enableAutoupdateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } )
					: disableAutoupdateMutate( { siteId: item.ID, pluginId: plugin?.id || '' } );

				// Return the promise so FieldActionToggle can show notices
				return mutation.catch( ( error: unknown ) => {
					setOptimisticAutoupdate( ( prev ) => ( {
						...prev,
						[ item.ID ]: previous,
					} ) );

					// rethrow so FieldActionToggle shows error notice
					throw error;
				} );
			} }
			successOn={ sprintf(
				// translators: %s is the name of the plugin.
				__( 'Auto‑updates for %s have been enabled.' ),
				plugin?.name ?? ''
			) }
			errorOn={ sprintf(
				// translators: %s is the name of the plugin.
				__( 'Failed to enable auto‑updates for %s.' ),
				plugin?.name ?? ''
			) }
			successOff={ sprintf(
				// translators: %s is the name of the plugin.
				__( 'Auto‑updates for %s have been disabled.' ),
				plugin?.name ?? ''
			) }
			errorOff={ sprintf(
				// translators: %s is the name of the plugin.
				__( 'Failed to disable auto‑updates for %s.' ),
				plugin?.name ?? ''
			) }
			actionId="autoupdate"
		/>
	);
};
