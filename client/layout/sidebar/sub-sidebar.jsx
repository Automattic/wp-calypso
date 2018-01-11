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
import Gridicon from 'gridicons';
import Card from 'components/card/compact';

class SubSidebar extends React.Component {
	static propTypes = {
		items: PropTypes.func.isRequired,
		title: PropTypes.func.isRequired,
		siteTitle: PropTypes.string.isRequired,
	};

	render() {
		const items = this.props.items();

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
					<Card className="sidebar__header-card" onClick={ this.props.resetSubSidebar }>
						<Gridicon className="sidebar__header-card__chevron" icon="chevron-left" />
						<h2 className="sidebar__header-card__section-title">{ this.props.title() }</h2>
						<h3 className="sidebar__header-card__site-title">{ this.props.siteTitle }</h3>
					</Card>
					{ listItems }
				</ul>
			</SidebarMenu>
		);
	}
}

export default SubSidebar;
