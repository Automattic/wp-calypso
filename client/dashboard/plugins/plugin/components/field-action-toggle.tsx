import { ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
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
	// Prevent default click (to avoid row selection etc.). Defaults to true.
	preventDefaultClick?: boolean;
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
	preventDefaultClick = true,
}: FieldActionToggleProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	return (
		<ToggleControl
			label={ label }
			checked={ checked }
			onClick={ ( e ) => {
				if ( preventDefaultClick ) {
					e.preventDefault();
				}
			} }
			onChange={ ( next ) => {
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
	);
}
