/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress Dependencies
 */
import { createSlotFill, withFocusReturn } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { ifCondition, compose } from '@wordpress/compose';

const { Fill, Slot } = createSlotFill( 'Sidebar' );

/**
 * Renders a sidebar with its content.
 *
 * @return {Object} The rendered sidebar.
 */
const Sidebar = ( { children, label } ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Fill>
			<div
				className="edit-post-sidebar"
				role="region"
				aria-label={ label }
				tabIndex="-1"
			>
				{ children }
			</div>
		</Fill>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

const WrappedSidebar = compose(
	withSelect( ( select, { name } ) => ( {
		isActive: select( 'core/edit-post' ).getActiveGeneralSidebarName() === name,
	} ) ),
	ifCondition( ( { isActive } ) => isActive ),
	withFocusReturn,
)( Sidebar );

WrappedSidebar.Slot = Slot;

export default WrappedSidebar;
