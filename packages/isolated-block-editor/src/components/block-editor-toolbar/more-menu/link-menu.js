/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { MenuGroup, MenuItem, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/** @typedef {import('../../../index').BlockEditorSettings} BlockEditorSettings */

/**
 * Link menu
 *
 * @param {object} props - Component props
 * @param {BlockEditorSettings} props.settings - Settings
 */
function LinkMenu( { settings } ) {
	const { linkMenu } = settings.iso;

	if ( linkMenu.length === 0 ) {
		return null;
	}

	return (
		<MenuGroup label={ __( 'Links' ) }>
			{ linkMenu.map( ( { title, url } ) => (
				<MenuItem key={ title }>
					<ExternalLink href={ url }>{ title }</ExternalLink>
				</MenuItem>
			) ) }
		</MenuGroup>
	);
}

export default LinkMenu;
