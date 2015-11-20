/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' );

/**
 * Main
 */
var ActionPanel = React.createClass( {

	render: function() {
		return (
			<Card className="settings-action-panel">
				{ this.props.children }
			</Card>
		);
	}

} );

module.exports = ActionPanel;
