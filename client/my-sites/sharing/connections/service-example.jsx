/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'SharingServiceExample',

	propTypes: {
		image: React.PropTypes.shape( {
			src: React.PropTypes.string,
			alt: React.PropTypes.string
		} ),
		label: React.PropTypes.node,
		single: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return { single: false };
	},

	render: function() {
		var classes = classNames( 'sharing-service-example', {
			'is-single': this.props.single
		} );

		return (
			<div className={ classes }>
				<div className="sharing-service-example-screenshot">
					<img src={ this.props.image.src } alt={ this.props.image.alt } />
				</div>
				<div className="sharing-service-example-screenshot-label">{ this.props.label }</div>
			</div>
		);
	}
} );
