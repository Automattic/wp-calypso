/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const handlerMouseOver = ( event ) => {
	event.target.focus();
};

const PopoverItem = ( props ) => {
	const {
		focusOnHover,
		className,
		href,
		icon,
		children
	} = props;

	const Component = href ? 'a' : 'button';

	return (
		<Component
			role="menuitem"
			onMouseOver={ focusOnHover ? handlerMouseOver : null }
			tabIndex="-1"
			{ ...omit( props, 'icon', 'focusOnHover' ) }
			className={ classnames( 'popover__menu-item', className ) }
		>
			{ icon && <Gridicon icon={ icon } size={ 18 } /> }
			{ children }
		</Component>
	);
};

PopoverItem.displayName = 'PopoverMenuItem';

PopoverItem.propTypes = {
	href: PropTypes.string,
	className: PropTypes.string,
	icon: PropTypes.string,
	focusOnHover: PropTypes.bool,
	children: PropTypes.node
};

PopoverItem.defaultProps = {
	focusOnHover: true
};

export default PopoverItem;
