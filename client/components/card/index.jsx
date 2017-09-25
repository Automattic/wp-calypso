/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { assign, omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

const Card = ( props ) => {
	const { href, tagName, target, compact, children, highlight } = props;

	const highlightClass = highlight ? 'is-' + highlight : false;

	const className = classnames( 'card', props.className, {
		'is-card-link': !! href,
		'is-compact': compact,
	}, highlightClass );

	const omitProps = [ 'compact', 'highlight', 'tagName' ];

	let linkIndicator;
	if ( href ) {
		linkIndicator = <Gridicon
			className="card__link-indicator"
			icon={ target ? 'external' : 'chevron-right' } />;
	} else {
		omitProps.push( 'href', 'target' );
	}

	return React.createElement(
		href ? 'a' : tagName,
		assign( omit( props, omitProps ), { className } ),
		linkIndicator,
		children
	);
};

Card.propTypes = {
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
};

Card.defaultProps = {
	tagName: 'div',
	highlight: false,
};

export default Card;
