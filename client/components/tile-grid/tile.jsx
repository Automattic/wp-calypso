/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

export default class extends React.PureComponent {
	static propTypes = {
		buttonLabel: PropTypes.string,
		className: PropTypes.string,
		description: PropTypes.string,
		href: PropTypes.string,
		image: PropTypes.string,
		onClick: PropTypes.func,
	};

	render() {
		const { buttonLabel, className, description, href, image, onClick } = this.props;
		const isClickable = href || onClick;
		const TileElement = isClickable ? 'a' : 'span';
		const tileClassName = classNames(
			'tile-grid__item',
			{
				'is-clickable': isClickable,
			},
			className
		);

		return (
			<Card className={ tileClassName }>
				<TileElement className="tile-grid__item-link" href={ href } onClick={ onClick }>
					{ image && (
						<div className="tile-grid__image">
							<img src={ image } />
						</div>
					) }
					<div className="tile-grid__item-copy">
						{ buttonLabel && (
							<Button className="tile-grid__cta" compact>
								{ buttonLabel }
							</Button>
						) }
						{ description && <p className="tile-grid__item-description">{ description }</p> }
					</div>
				</TileElement>
			</Card>
		);
	}
}
