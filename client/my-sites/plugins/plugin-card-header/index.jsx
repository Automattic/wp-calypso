/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CompactCard = require( 'components/card/compact' );

module.exports = React.createClass( {

	displayName: 'PluginCardHeader',

	renderTextInCard: function() {
		return (
			<CompactCard>
				<h3 className="plugin-card-header__text">{ this.props.text }</h3>
			</CompactCard>
		);
	},

	render: function() {
		return (
			<div className="plugin-card-header">
				{
					this.props.text ?
					this.renderTextInCard() :
					this.props.children
				}
			</div>
		);
	}
} );
