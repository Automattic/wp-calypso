/**
 * External Dependencies
 */
var React = require( 'react' );

/**
 * Internal Dependencies
 */
var Gridicon = require( 'components/gridicon' );

var LikeIcons = React.createClass( {

	propTypes: { size: React.PropTypes.number, },

	getDefaultProps: function() {
		return { size: 24 };
	},

	render: function() {

		var size = this.props.size;

		return (
			<span className="gridicon__wrapper">
				<Gridicon icon="star" />
				<Gridicon icon="star-outline" />
			</span>
		);
	}
} );

module.exports = LikeIcons;
