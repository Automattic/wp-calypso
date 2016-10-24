/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Main
 */
var ActionPanelFooter = React.createClass( {

	render: function() {
		return (
			<div className="settings-action-panel__footer">
				{ this.props.children }
			</div>
		);
	}

} );

module.exports = ActionPanelFooter;
