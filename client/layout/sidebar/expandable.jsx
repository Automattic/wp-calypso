/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { get, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import ExpandableSidebarAddForm from './expandable-add-form';
import ExpandableSidebarHeading from './expandable-heading';
import SidebarMenu from 'layout/sidebar/menu';
import TranslatableString from 'components/translatable/proptype';

function containsSelectedSidebarItem( children ) {
	let selectedItemFound = false;

	React.Children.forEach( children, child => {
		if ( selectedItemFound ) {
			return true;
		}

		if ( get( child, 'props.selected' ) ) {
			selectedItemFound = true;
		} else {
			const descendants = get( child, 'props.children' );

			if ( descendants ) {
				selectedItemFound = containsSelectedSidebarItem( descendants );
			}
		}
	} );

	return selectedItemFound;
}

export const ExpandableSidebarMenu = props => {
	const {
		className,
		title,
		count,
		onClick,
		icon,
		materialIcon,
		hideAddButton,
		addLabel,
		addPlaceholder,
		onAddClick,
		onAddSubmit,
	} = props;

	let { expanded } = props;

	if ( null === expanded ) {
		expanded = containsSelectedSidebarItem( props.children );
	}

	const classes = classNames( className, {
		'is-toggle-open': !! expanded,
		'is-togglable': true,
	} );

	const menuId = uniqueId( 'menu' );

	const renderAddForm = onAddClick || onAddSubmit || addLabel || addPlaceholder;
	let addForm = null;

	if ( renderAddForm ) {
		addForm = (
			<ExpandableSidebarAddForm
				hideAddButton={ hideAddButton }
				addLabel={ addLabel }
				addPlaceholder={ addPlaceholder }
				onAddClick={ onAddClick }
				onAddSubmit={ onAddSubmit }
			/>
		);
	}

	return (
		<SidebarMenu className={ classes }>
			<ExpandableSidebarHeading
				title={ title }
				count={ count }
				onClick={ onClick }
				icon={ icon }
				materialIcon={ materialIcon }
				expanded={ expanded }
				menuId={ menuId }
			/>
			<div
				role="region"
				id={ menuId }
				className="sidebar__expandable-content"
				hidden={ ! expanded }
			>
				{ props.children }
			</div>
			{ addForm }
		</SidebarMenu>
	);
};

ExpandableSidebarMenu.propTypes = {
	title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ).isRequired,
	count: PropTypes.number,
	addLabel: TranslatableString,
	addPlaceholder: TranslatableString,
	onAddSubmit: PropTypes.func,
	onAddClick: PropTypes.func,
	onClick: PropTypes.func,
	hideAddButton: PropTypes.bool,
	icon: PropTypes.string,
	expanded: PropTypes.bool,
};

ExpandableSidebarMenu.defaultProps = {
	hideAddButton: false,
};

export default ExpandableSidebarMenu;
