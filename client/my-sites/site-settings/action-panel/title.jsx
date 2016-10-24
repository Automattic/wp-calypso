/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Main
 */
var ActionPanelTitle = React.createClass( {

	render: function() {
		return (
			<h2 className="settings-action-panel__title">
				{ this.props.children }
			</h2>
		);
	}

} );

module.exports = ActionPanelTitle;
