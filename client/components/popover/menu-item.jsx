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
		isVisible: PropTypes.bool,
		className: PropTypes.string,
		icon: PropTypes.string,
		focusOnHover: PropTypes.bool
	},

	getDefaultProps() {
		return {
			isVisible: false,
			className: '',
			focusOnHover: true
		};
	},

	render() {
		const { focusOnHover, className, disabled, onClick, icon, children } = this.props;
		const onMouseOver = focusOnHover ? this._onMouseOver : null;

		return (
			<button
				className={ classnames( 'popover__menu-item', className ) }
				role="menuitem"
				disabled={ disabled }
				onClick={ onClick }
				onMouseOver={ onMouseOver }
				tabIndex="-1">
				{ icon && <Gridicon icon={ icon } size={ 18 } /> }
				{ children }
			</button>
		);
	},

	_onMouseOver( event ) {
		event.target.focus();
	}
} );
