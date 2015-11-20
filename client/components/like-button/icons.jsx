/**
 * External Dependencies
 */
var React = require( 'react' );

var LikeIcons = React.createClass( {

	propTypes: { size: React.PropTypes.number, },

	getDefaultProps: function() {
		return { size: 24 };
	},

	render: function() {

		var size = this.props.size;

		return (
			<span className="gridicon__wrapper">
				<svg className="gridicon gridicon__liked"
					height={ size }
					width={ size }
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24">
					<g><path d="M11.875 2l2.582 6.953 7.418.304-5.822 4.602L18.055 21l-6.18-4.11L5.695 21l2.002-7.14-5.822-4.603 7.418-.304"/></g>
				</svg>
				<svg className="gridicon gridicon__like-empty"
					height={ size }
					width={ size }
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24">
					<g><path d="M12 4.872l1.645 4.43.232.623.665.027 4.722.194-3.705 2.93-.524.412.18.64 1.275 4.547-3.935-2.617L12 15.69l-.554.368-3.936 2.617 1.275-4.546.18-.642-.523-.413-3.705-2.93 4.722-.193.664-.027.232-.624L12 4.873M12 2L9.418 8.953 2 9.257l5.822 4.602L5.82 21 12 16.89 18.18 21l-2.002-7.14L22 9.256l-7.418-.305L12 2z"/></g>
				</svg>
			</span>
		);
	}
} );

module.exports = LikeIcons;
