/**
 * External Dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import SidebarMenu from 'layout/sidebar/menu';
import ExpandableSidebarHeading from './expandable-heading';
import ExpandableSidebarAddForm from './expandable-add-form';

const ExpandableSidebarMenu = React.createClass( {

	propTypes: {
		title: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] ).isRequired,
		count: React.PropTypes.number,
		addLabel: React.PropTypes.string,
		addPlaceholder: React.PropTypes.string,
		onAddSubmit: React.PropTypes.func,
		onAddClick: React.PropTypes.func,
		onClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			expanded: false
		};
	},

	render() {
		const classes = classNames(
			this.props.className,
			{
				'is-toggle-open': !! this.props.expanded,
				'is-togglable': true
			}
		);

		return (
			<SidebarMenu className={ classes }>
				<ExpandableSidebarHeading title={ this.props.title } count={ this.props.count } onClick={ this.props.onClick } />
				<ExpandableSidebarAddForm addLabel={ this.props.addLabel } addPlaceholder={ this.props.addPlaceholder } onAddClick={ this.props.onAddClick } onAddSubmit={ this.props.onAddSubmit } />
				<ul className="sidebar__menu-list">
					{ this.props.children }
				</ul>
			</SidebarMenu>
		);
	}
} );

export default ExpandableSidebarMenu;
