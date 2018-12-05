/** @format */
/**
 * External Dependencies
 */
import React from 'react';

/**
 * WordPress Dependencies
 */
import { withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { MenuItem } from '@wordpress/components';

export function OptionsMenuItem( { openModal, onSelect } ) {
	return (
		<MenuItem
			onClick={ () => {
				onSelect();
				openModal( 'edit-post/options' );
			} }
		>
			{ __( 'Options' ) }
		</MenuItem>
	);
}

export default withDispatch( dispatch => {
	const { openModal } = dispatch( 'core/edit-post' );

	return {
		openModal,
	};
} )( OptionsMenuItem );
