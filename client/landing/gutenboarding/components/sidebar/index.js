/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';
import { createSlotFill, Animate } from '@wordpress/components';
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

const { Fill, Slot } = createSlotFill( 'Sidebar' );

function Sidebar( { children, label, className } ) {
	return (
		<div
			className={ classnames( 'edit-post-sidebar', className ) }
			role="region"
			aria-label={ label }
			tabIndex="-1"
		>
			{ children }
		</div>
	);
}

function AnimatedSidebarFill( props ) {
	return (
		<Fill>
			<Animate type="slide-in" options={ { origin: 'left' } }>
				{ () => <Sidebar { ...props } /> }
			</Animate>
		</Fill>
	);
}

const WrappedSidebar = compose(
	withSelect( ( select, { isActive } ) => ( { isActive } ) ),
	ifCondition( ( { isActive } ) => isActive )
)( AnimatedSidebarFill );

WrappedSidebar.Slot = Slot;

export default WrappedSidebar;
