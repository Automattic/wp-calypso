import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { ComponentProps } from 'react';
import { useAnalytics } from '../../../app/analytics';

import './field-action-toggle.scss';

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
	const { createSuccessNotice, createErrorNotice, createInfoNotice, removeNotice } =
		useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	const handleChange = ( next: boolean ) => {
		if ( disabled ) {
			return;
		}

		recordTracksEvent( 'calypso_dashboard_plugins_toggle_click', {
			action_id: actionId,
			next_state: next ? 'enable' : 'disable',
		} );

		let processingMessage: string;
		if ( actionId === 'activate' ) {
			processingMessage = next ? __( 'Activating' ) : __( 'Deactivating' );
		} else {
			processingMessage = next ? __( 'Enabling auto-updates' ) : __( 'Disabling auto-updates' );
		}

		const processingNoticeId = `field-action-toggle-${ actionId }-${ next ? 'on' : 'off' }`;

		createInfoNotice( processingMessage, {
			id: processingNoticeId,
			type: 'snackbar',
			isDismissible: false,
		} );

		Promise.resolve( onToggle( next ) )
			.then( () => {
				createSuccessNotice( next ? successOn : successOff, {
					type: 'snackbar',
				} );
			} )
			.catch( () => {
				createErrorNotice( next ? errorOn : errorOff, {
					type: 'snackbar',
				} );
			} )
			.finally( () => {
				removeNotice( processingNoticeId );
			} );
	};

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
				disabled={ disabled }
				onChange={ handleChange }
			/>
		</div>
	);
}
