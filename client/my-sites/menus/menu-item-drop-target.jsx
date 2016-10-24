/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

/**
 * Target tap/click zone for choosing the placing of a new or moved item.
 */
var MenuItemDropTarget = React.createClass( {

	onClick: function() {
		var positionText = { before: 'above', after: 'below', child: 'to children' },
			actionText = 'Clicked ' + this.props.operation + ' menu item ' + positionText[this.props.position];

		analytics.ga.recordEvent( 'Menus', actionText );
		this.props.action();
	},

	render: function() {
		var label = {
			move: {
				before: this.translate( 'Move item above' ),
				after: this.translate( 'Move item below' ),
				child: this.translate( 'Move item to children' )
			},
			add: {
				before: this.translate( 'Add menu item above' ),
				after: this.translate( 'Add menu item below' ),
				child: this.translate( 'Add menu item to children' )
			}
		}[ this.props.operation ][ this.props.position ];

		return (
			<a key={ this.props.operation + '-' + this.props.position } onClick={ this.onClick }
				className={ 'menus__menu-item is-lander depth-' + this.props.depth + ' ' + this.props.className }>
					<span className="noticon noticon-plus" >{ label }</span>
			</a>
		);
	}
} );

module.exports = MenuItemDropTarget;
