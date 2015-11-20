/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'NoticeArrowAction',

	propTypes: {
		href: React.PropTypes.string,
		target: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	render: function() {
		return (
			<a
				className="notice__arrow-link"
				{ ...this.props }>
				<span>{ this.props.children }</span>
				<Gridicon icon="arrow-right" size={ 24 } />
			</a>
		);
	}

} );
