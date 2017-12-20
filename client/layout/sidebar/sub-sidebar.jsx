/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';

class SubSidebar extends React.Component {
	static propTypes = {
		items: PropTypes.func.isRequired,
	};

	render() {
		const items = this.props.items();
		console.log( 'items:', items );

		if ( !items ) {
			return(
				<SidebarMenu className="sidebar__sub-sidebar" />
			);
		}

		const listItems = items.map( ( item ) =>
			<SidebarItem
				label={ item.label }
				link={ item.link }
				icon={ item.icon }
				key={ item.link }
			/>
		);
		return(
			<SidebarMenu className="sidebar__sub-sidebar">
				<ul className={ classNames( 'sub-sidebar__list', this.props.className ) }>
				<SidebarItem
					label="← Back"
					key="back"
					onNavigate={ this.props.resetSubSidebar }
				/>
					{ listItems }
				</ul>
			</SidebarMenu>
		);
	}
}

export default SubSidebar;
