/**
 * External Dependencies
 */

var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal Dependencies
 */

module.exports = React.createClass( {
	props: {
		status: React.PropTypes.string
	},
	displayName: 'SiteNotice',

	render: function() {
		let status = this.props.status || 'is-info',
			classes = classNames( 'site-notice', status );
		return (
			<span className={ classes }>
				{ this.props.children }
			</span>
		);
	}
} );
