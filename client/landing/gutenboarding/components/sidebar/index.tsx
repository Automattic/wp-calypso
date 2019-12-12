/**
 * External dependencies
 */
import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { createSlotFill, Animate } from '@wordpress/components';
import { ifCondition } from '@wordpress/compose';

const { Fill, Slot } = createSlotFill( 'Sidebar' );

interface Props {
	className: string;
	label: string;
}

const Sidebar: FunctionComponent< Props > = ( { children, className, label } ) => {
	return (
		<div
			className={ classnames( 'edit-post-sidebar', className ) }
			role="region"
			aria-label={ label }
			tabIndex={ -1 }
		>
			{ children }
		</div>
	);
};

const AnimatedSidebarFill: FunctionComponent< Props > = props => {
	return (
		<Fill>
			<Animate type="slide-in" options={ { origin: 'left' } }>
				{ () => <Sidebar { ...props } /> }
			</Animate>
		</Fill>
	);
};

interface WrappedProps extends Props {
	isActive: boolean;
}

const WrappedSidebar = ifCondition< WrappedProps >( ( { isActive } ) => isActive )(
	AnimatedSidebarFill
);

export { Slot };
export default WrappedSidebar;
