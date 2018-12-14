/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress Dependencies
 */
import { MenuGroup } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import { ifViewportMatches } from '@wordpress/viewport';

/**
 * Internal dependencies
 */
import FeatureToggle from '../feature-toggle';

function WritingMenu( { onClose } ) {
	return (
		<MenuGroup label={ _x( 'View', 'noun' ) }>
			<FeatureToggle
				feature="fixedToolbar"
				label={ __( 'Top Toolbar' ) }
				info={ __( 'Access all block and document tools in a single place' ) }
				onToggle={ onClose }
			/>
			<FeatureToggle
				feature="focusMode"
				label={ __( 'Spotlight Mode' ) }
				info={ __( 'Focus on one block at a time' ) }
				onToggle={ onClose }
			/>
		</MenuGroup>
	);
}

export default ifViewportMatches( 'medium' )( WritingMenu );
