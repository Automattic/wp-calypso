/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import GridiconChevronRight from 'gridicons/dist/chevron-right';
import GridiconExternal from 'gridicons/dist/external';
import PropTypes from 'prop-types';

const getClassName = ( { className, compact, displayAsLink, highlight, href, onClick } ) =>
	classNames(
		'card',
		className,
		{
			'is-card-link': displayAsLink || !! href,
			'is-clickable': !! onClick,
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
		tagName: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ).isRequired,
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
			compact,
			displayAsLink,
			highlight,
			tagName: TagName,
			href,
			target,
			...props
		} = this.props;

		return href ? (
			<a { ...props } href={ href } target={ target } className={ getClassName( this.props ) }>
				{ target ? (
					<GridiconExternal className="card__link-indicator" />
				) : (
					<GridiconChevronRight className="card__link-indicator" />
				) }
				{ children }
			</a>
		) : (
			<TagName { ...props } className={ getClassName( this.props ) }>
				{ displayAsLink &&
					( target ? (
						<GridiconExternal className="card__link-indicator" />
					) : (
						<GridiconChevronRight className="card__link-indicator" />
					) ) }
				{ children }
			</TagName>
		);
	}
}

export default Card;
