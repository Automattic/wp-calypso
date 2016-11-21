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

export const ExpandableSidebarMenu = ( props ) => {
	const { className, expanded, title, count, 
		onClick, hideAddButton, addLabel, 
		addPlaceholder, onAddClick, onAddSubmit } = props;
	const classes = classNames(
		className,
		{
			'is-toggle-open': !! expanded,
			'is-togglable': true
		}
	);
	return (
		<SidebarMenu className={ classes }>
			<ExpandableSidebarHeading title={ title } count={ count } onClick={ onClick } />
			<ExpandableSidebarAddForm hideAddButton={ hideAddButton } addLabel={ addLabel } addPlaceholder={ addPlaceholder } onAddClick={ onAddClick } onAddSubmit={ onAddSubmit } />
			<ul className="sidebar__menu-list">
				{ props.children }
			</ul>
		</SidebarMenu>
	);
};

ExpandableSidebarMenu.propTypes = {
	title: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] ).isRequired,
	count: React.PropTypes.number,
	addLabel: React.PropTypes.string,
	addPlaceholder: React.PropTypes.string,
	onAddSubmit: React.PropTypes.func,
	onAddClick: React.PropTypes.func,
	onClick: React.PropTypes.func,
	hideAddButton: React.PropTypes.bool,
};

ExpandableSidebarMenu.defaultProps = {
	expanded: false,
	hideAddButton: false,
};

export default ExpandableSidebarMenu;
