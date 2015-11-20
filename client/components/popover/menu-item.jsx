/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' );

var MenuItem = React.createClass( {
	getDefaultProps: function() {
		return {
			isVisible: false,
			className: '',
			focusOnHover: true
		};
	},

	render: function() {
		var onMouseOver = this.props.focusOnHover ? this._onMouseOver : null;
		return (
			<button className={ joinClasses( 'popover__menu-item', this.props.className ) }
					role="menuitem"
					disabled={ this.props.disabled }
					onClick={ this.props.onClick }
					onMouseOver={ onMouseOver }
					tabIndex="-1">
				{ this.props.children }
			</button>
		);
	},

	_onMouseOver: function() {
		this.getDOMNode().focus();
	}
} );

module.exports = MenuItem;
