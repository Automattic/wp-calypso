/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { assign, omit } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'Card',

	propTypes: {
		className: React.PropTypes.string,
		href: React.PropTypes.string,
		tagName: React.PropTypes.string,
		target: React.PropTypes.string,
		compact: React.PropTypes.bool,
		children: React.PropTypes.node
	},

	getDefaultProps() {
		return {
			tagName: 'div'
		};
	},

	render: function() {
		const className = classnames( 'card', this.props.className, {
			'is-card-link': !! this.props.href,
			'is-compact': this.props.compact
		} );

		const omitProps = [ 'compact', 'tagName' ];

		let linkIndicator;
		if ( this.props.href ) {
			linkIndicator = <Gridicon
				className="card__link-indicator"
				icon={ this.props.target ? 'external' : 'chevron-right' } />;
		} else {
			omitProps.push( 'href', 'target' );
		}

		return React.createElement(
			this.props.href ? 'a' : this.props.tagName,
			assign( omit( this.props, omitProps ), { className } ),
			linkIndicator,
			this.props.children
		);
	}
} );
