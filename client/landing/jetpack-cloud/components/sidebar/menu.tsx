/**
 * External dependencies
 */
import React, { ReactElement, ReactChildren } from 'react';

/**
 * Internal dependencies
 */
import SidebarMenu from 'layout/sidebar/menu';
import StaticSidebarHeading from './heading';

interface Props {
	label: string;
	className?: string;
	materialIcon?: string;
	materialIconStyle?: string;
	onClick?: CallableFunction;
	children: ReactChildren;
	expanded: boolean;
	link?: string;
}

function StaticSidebarMenu( props: Props ): ReactElement {
	return (
		<SidebarMenu className={ props.className }>
			<StaticSidebarHeading
				title={ props.label }
				materialIcon={ props.materialIcon }
				materialIconStyle={ props.materialIconStyle }
				onClick={ props.onClick }
				link={ props.link }
			/>
			<div role="region" className="sidebar__menu-content" hidden={ ! props.expanded }>
				{ props.children }
			</div>
		</SidebarMenu>
	);
}

export default StaticSidebarMenu;
