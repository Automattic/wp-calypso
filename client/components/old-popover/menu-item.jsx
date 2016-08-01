/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'PopoverMenuItem',

	propTypes: {
		href: PropTypes.string,
		isVisible: PropTypes.bool,
		className: PropTypes.string,
		icon: PropTypes.string,
		focusOnHover: PropTypes.bool,
		children: PropTypes.node
	},

	getDefaultProps() {
		return {
			isVisible: false,
			className: '',
			focusOnHover: true
		};
	},

	render() {
		const { focusOnHover, className, href, icon, children } = this.props;
		const onMouseOver = focusOnHover ? this._onMouseOver : null;
		const Component = href ? 'a' : 'button';

		return (
			<Component
				role="menuitem"
				onMouseOver={ onMouseOver }
				tabIndex="-1"
				{ ...this.props }
				className={ classnames( 'popover__menu-item', className ) }>
				{ icon && <Gridicon icon={ icon } size={ 18 } /> }
				{ children }
			</Component>
		);
	},

	_onMouseOver( event ) {
		event.target.focus();
	}
} );
