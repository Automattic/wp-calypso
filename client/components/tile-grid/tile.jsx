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
		buttonClassName: PropTypes.string,
		buttonLabel: PropTypes.string,
		className: PropTypes.string,
		description: PropTypes.string,
		highlighted: PropTypes.bool,
		href: PropTypes.string,
		image: PropTypes.string,
		onClick: PropTypes.func,
	};

	render() {
		const {
			buttonClassName,
			buttonLabel,
			className,
			description,
			highlighted,
			href,
			image,
			onClick,
		} = this.props;
		const tileClassName = classNames(
			'tile-grid__item',
			{
				'is-highlighted': highlighted,
			},
			className
		);

		return (
			<Card className={ tileClassName } href={ href } onClick={ onClick } tabIndex="-1">
				{ image && (
					<div className="tile-grid__image">
						<img src={ image } />
					</div>
				) }
				<div className="tile-grid__item-copy">
					{ buttonLabel && (
						<Button
							className={ classNames( 'tile-grid__cta', buttonClassName ) }
							compact={ !! description }
						>
							{ buttonLabel }
						</Button>
					) }
					{ description && <p className="tile-grid__item-description">{ description }</p> }
				</div>
			</Card>
		);
	}
}
