/**
 * External dependencies
 */
import React from 'react';
import { assign, omit } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'gridicons';
import CreateClass from 'create-react-class';
import PropTypes from 'prop-types';

export default CreateClass( {
	displayName: 'Card',

	propTypes: {
		className: PropTypes.string,
		href: PropTypes.string,
		tagName: PropTypes.string,
		target: PropTypes.string,
		compact: PropTypes.bool,
		children: PropTypes.node,
		highlight: PropTypes.oneOf( [
			false,
			'error',
			'info',
			'success',
			'warning',
		] ),
	},

	getDefaultProps() {
		return {
			tagName: 'div',
			highlight: false,
		};
	},

	getHighlightClass() {
		const { highlight } = this.props;
		if ( ! highlight ) {
			return false;
		}

		return 'is-' + highlight;
	},

	render: function() {
		const className = classnames( 'card', this.props.className, {
			'is-card-link': !! this.props.href,
			'is-compact': this.props.compact,
		}, this.getHighlightClass() );

		const omitProps = [ 'compact', 'highlight', 'tagName' ];

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
