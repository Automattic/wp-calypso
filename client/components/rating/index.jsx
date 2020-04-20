/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { times } from 'lodash';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default class Rating extends React.PureComponent {
	static defaultProps = {
		rating: 0,
		size: 24,
	};

	static propTypes = {
		rating: PropTypes.number,
		size: PropTypes.number,
	};

	overlayStars() {
		const { size } = this.props;

		const starStyles = {
			width: size + 'px',
			height: size + 'px',
		};

		return times( 5, ( i ) => <Gridicon key={ i } icon="star" style={ starStyles } /> );
	}

	outlineStars() {
		const { rating, size } = this.props;

		const inverseRating = 100 - Math.round( rating / 10 ) * 10;
		const noFillOutlineCount = Math.floor( inverseRating / 20 );

		const starStyles = {
			width: size + 'px',
			height: size + 'px',
		};

		return times( 5, ( i ) => {
			const isEmpty = i >= 5 - noFillOutlineCount;
			const className = classNames( { 'is-empty': isEmpty } );
			return (
				<Gridicon key={ i } icon="star-outline" className={ className } style={ starStyles } />
			);
		} );
	}

	render() {
		const { rating, size } = this.props;

		const totalWidth = size * 5;
		const roundRating = Math.round( rating / 10 ) * 10;
		const maskPosition = ( roundRating / 100 ) * totalWidth;
		const clipPathMaskPosition = totalWidth - maskPosition + 'px';
		const overlayHeightPx = size + 'px';
		const overlayStyles = {
			WebkitClipPath: 'inset(0 ' + clipPathMaskPosition + ' 0 0 )',
			clipPath: 'inset(0 ' + clipPathMaskPosition + ' 0 0 )',
			clip: 'rect(0, ' + ( maskPosition + 'px' ) + ', ' + overlayHeightPx + ', 0)',
			width: totalWidth + 'px',
		};

		return (
			<div className="rating" style={ { width: totalWidth + 'px', height: size + 'px' } }>
				<div className="rating__overlay" style={ overlayStyles }>
					{ this.overlayStars() }
				</div>
				<div className="rating__star-outline">{ this.outlineStars() }</div>
			</div>
		);
	}
}
