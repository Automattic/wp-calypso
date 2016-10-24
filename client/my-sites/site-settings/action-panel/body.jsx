/**
 * External dependencies
 */
var React = require( 'react' );

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
