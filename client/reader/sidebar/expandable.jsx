/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ExpandableSidebarAddForm from './expandable-add-form';
import ExpandableSidebarHeading from './expandable-heading';
import SidebarMenu from 'layout/sidebar/menu';

export const ExpandableSidebarMenu = props => {
	const {
		className,
		expanded,
		title,
		count,
		onClick,
		hideAddButton,
		addLabel,
		addPlaceholder,
		onAddClick,
		onAddSubmit,
	} = props;
	const classes = classNames( className, {
		'is-toggle-open': !! expanded,
		'is-togglable': true,
	} );
	return (
		<SidebarMenu className={ classes }>
			<ExpandableSidebarHeading title={ title } count={ count } onClick={ onClick } />
			<ExpandableSidebarAddForm
				hideAddButton={ hideAddButton }
				addLabel={ addLabel }
				addPlaceholder={ addPlaceholder }
				onAddClick={ onAddClick }
				onAddSubmit={ onAddSubmit }
			/>
			<ul className="sidebar__menu-list">{ props.children }</ul>
		</SidebarMenu>
	);
};

ExpandableSidebarMenu.propTypes = {
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] )
		.isRequired,
	count: PropTypes.number,
	addLabel: PropTypes.string,
	addPlaceholder: PropTypes.string,
	onAddSubmit: PropTypes.func,
	onAddClick: PropTypes.func,
	onClick: PropTypes.func,
	hideAddButton: PropTypes.bool,
};

ExpandableSidebarMenu.defaultProps = {
	expanded: false,
	hideAddButton: false,
};

export default ExpandableSidebarMenu;
