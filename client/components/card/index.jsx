/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

const getClassName = ( { className, compact, highlightClass, href, onClick } ) =>
	classNames(
		'card',
		className,
		{
			'is-card-link': !! href,
			'is-clickable': !! onClick,
			'is-compact': compact,
			'is-highlight': highlightClass,
		},
		highlightClass
	);

class Card extends PureComponent {
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
		const {
			children,
			compact, // eslint-disable-line no-unused-vars
			highlight, // eslint-disable-line no-unused-vars
			highlightClass, // eslint-disable-line no-unused-vars
			tagName: TagName,
			href,
			target,
			...props
		} = this.props;

		return href ? (
			<a { ...props } href={ href } target={ target } className={ getClassName( this.props ) }>
				<Gridicon className="card__link-indicator" icon={ target ? 'external' : 'chevron-right' } />
				{ children }
			</a>
		) : (
			<TagName { ...props } className={ getClassName( this.props ) }>
				{ children }
			</TagName>
		);
	}
}

export default Card;
