/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';
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
		compact: React.PropTypes.bool
	},

	render: function() {
		const className = classnames( 'card', this.props.className, {
			'is-card-link': !! this.props.href,
			'is-compact': this.props.compact
		} );

		let element = this.props.tagName || 'div';
		let childProps = { ...omit( this.props, [ 'compact', 'tagName' ] ), className };
		let linkIndicator;
		if ( this.props.href ) {
			element = 'a';
			linkIndicator = <Gridicon
				className="card__link-indicator"
				icon={ this.props.target ? 'external' : 'chevron-right' } />;
		} else {
			childProps = omit( childProps, [ 'href', 'target' ] );
		}

		return React.createElement(
			element,
			childProps,
			this.props.href ? linkIndicator : null,
			this.props.children
		);
	}
} );
