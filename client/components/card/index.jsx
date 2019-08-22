/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

/**
 * Style dependencies
 */
import './style.scss';

const getClassName = ( { className, compact, displayAsLink, highlight, href, onClick } ) =>
	classNames(
		'card',
		className,
		{
			'is-card-link': displayAsLink || href,
			'is-clickable': onClick,
			'is-compact': compact,
			'is-highlight': highlight,
		},
		highlight ? 'is-' + highlight : false
	);

class Card extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		displayAsLink: PropTypes.bool,
		href: PropTypes.string,
		tagName: PropTypes.elementType,
		target: PropTypes.string,
		compact: PropTypes.bool,
		highlight: PropTypes.oneOf( [ 'error', 'info', 'success', 'warning' ] ),
	};

	render() {
		const {
			children,
			compact,
			displayAsLink,
			highlight,
			tagName: TagName = 'div',
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
				{ displayAsLink && (
					<Gridicon
						className="card__link-indicator"
						icon={ target ? 'external' : 'chevron-right' }
					/>
				) }
				{ children }
			</TagName>
		);
	}
}

export default Card;
