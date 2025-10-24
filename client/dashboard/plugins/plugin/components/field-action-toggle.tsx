import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../app/analytics';
import type { ComponentProps } from 'react';

export type FieldActionToggleProps = {
	label: ComponentProps< typeof ToggleControl >[ 'label' ];
	checked: boolean;
	disabled?: boolean;
	// Called when toggle changes. Should perform the action and return a promise.
	// Receives the next value (true for enabling, false for disabling).
	onToggle: ( next: boolean ) => Promise< unknown >;
	// i18n-ready message templates with %s replaced by the plugin name already, if desired.
	successOn: string;
	errorOn: string;
	successOff: string;
	errorOff: string;
	// Action identifier used for analytics: e.g. "activate" or "autoupdate".
	actionId: 'activate' | 'autoupdate';
};

export default function FieldActionToggle( {
	label,
	checked,
	disabled,
	onToggle,
	successOn,
	errorOn,
	successOff,
	errorOff,
	actionId,
}: FieldActionToggleProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	return (
		<div
			role="presentation"
			onClick={ ( e ) => e.stopPropagation() }
			onMouseDown={ ( e ) => e.stopPropagation() }
			onKeyDown={ ( e ) => e.stopPropagation() }
		>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ label }
				checked={ checked }
				onChange={ ( next ) => {
					recordTracksEvent( 'calypso_dashboard_plugins_toggle_click', {
						action_id: actionId,
						next_state: next ? 'enable' : 'disable',
					} );
					onToggle( next )
						.then( () => {
							createSuccessNotice( next ? successOn : successOff, { type: 'snackbar' } );
						} )
						.catch( () => {
							createErrorNotice( next ? errorOn : errorOff, { type: 'snackbar' } );
						} );
				} }
				disabled={ disabled }
			/>
		</div>
	);
}
