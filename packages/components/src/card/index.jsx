/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Gridicon from '../gridicon';

/**
 * Style dependencies
 */
import './style.scss';

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
			className,
			compact,
			displayAsLink,
			highlight,
			tagName: TagName = 'div',
			href,
			target,
			...props
		} = this.props;

		const elementClass = classNames(
			'card',
			className,
			{
				'is-card-link': displayAsLink || href,
				'is-clickable': this.props.onClick,
				'is-compact': compact,
				'is-highlight': highlight,
			},
			highlight ? 'is-' + highlight : false
		);

		return href ? (
			<a { ...props } href={ href } target={ target } className={ elementClass }>
				<Gridicon className="card__link-indicator" icon={ target ? 'external' : 'chevron-right' } />
				{ children }
			</a>
		) : (
			<TagName { ...props } className={ elementClass }>
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
