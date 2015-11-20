/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Main
 */
var ActionPanelBody = React.createClass( {

	render: function() {
		return (
			<div className="settings-action-panel__body">
				{ this.props.children }
			</div>
		);
	}

} );

module.exports = ActionPanelBody;
