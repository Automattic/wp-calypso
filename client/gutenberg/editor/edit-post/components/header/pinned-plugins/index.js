/**
 * External dependencies
 */
import React from 'react';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

const { Fill: PinnedPlugins, Slot } = createSlotFill( 'PinnedPlugins' );

/* eslint-disable wpcalypso/jsx-classname-namespace */
PinnedPlugins.Slot = ( props ) => (
	<Slot { ...props }>
		{ ( fills ) => ! isEmpty( fills ) && (
			<div className="edit-post-pinned-plugins">
				{ fills }
			</div>
		) }
	</Slot>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default PinnedPlugins;
