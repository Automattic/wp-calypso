/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { assign, omit } from 'lodash';
import classnames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

class Card extends Component {
	static propTypes = {
		className: PropTypes.string,
		href: PropTypes.string,
		tagName: PropTypes.string,
		target: PropTypes.string,
		compact: PropTypes.bool,
		highlight: PropTypes.oneOf( [ false, 'error', 'info', 'success', 'warning' ] ),
	};

	static defaultProps = {
		tagName: 'div',
		highlight: false,
	};

	render() {
		const { children, compact, highlight, href, onClick, tagName, target } = this.props;

		const highlightClass = highlight ? 'is-' + highlight : false;

		const className = classnames(
			'card',
			this.props.className,
			{
				'is-card-link': !! href,
				'is-clickable': !! onClick,
				'is-compact': compact,
			},
			highlightClass
		);

		const omitProps = [ 'compact', 'highlight', 'tagName' ];

		let linkIndicator;
		if ( href ) {
			linkIndicator = (
				<Gridicon className="card__link-indicator" icon={ target ? 'external' : 'chevron-right' } />
			);
		} else {
			omitProps.push( 'href', 'target' );
		}

		return React.createElement(
			href ? 'a' : tagName,
			assign( omit( this.props, omitProps ), { className } ),
			linkIndicator,
			children
		);
	}
}

export default Card;
