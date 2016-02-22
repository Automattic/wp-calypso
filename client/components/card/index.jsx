/** @ssr-ready **/

/**
 * External dependencies
 */
var React = require( 'react' ),
	assign = require( 'lodash/assign' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'Card',

	propTypes: {
		className: React.PropTypes.string,
		href: React.PropTypes.string,
		tagName: React.PropTypes.string,
		target: React.PropTypes.string
	},

	render: function() {
		var element = this.props.tagName || 'div',
			linkClassName = this.props.href ? 'is-card-link' : null,
			props = assign( {}, this.props, { className: classnames( this.props.className, 'card', linkClassName ) } ),
			linkIndicator = null;

		if ( this.props.href ) {
			element = 'a';
			linkIndicator = <Gridicon
				className="card__link-indicator"
				icon={ this.props.target ? 'external' : 'chevron-right' } />;
		}

		return React.createElement(
			element,
			props,
			this.props.href ? linkIndicator : null,
			this.props.children
		);
	}
} );
