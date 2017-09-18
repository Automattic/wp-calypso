/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

module.exports = React.createClass( {

	displayName: 'Rating',

	getDefaultProps: function() {
		return { rating: 0 };
	},

	propTypes: {
		rating: PropTypes.number,
		size: PropTypes.number
	},

	overlayStars: function() {
		let i;
		const stars = [];
		const starStyles = {
			width: this.props.size
				? this.props.size + 'px'
				: '24px',
			height: this.props.size
				? this.props.size + 'px'
				: '24px'
		};

		for ( i = 1; i < 6; i++ ) {
			stars.push(
				<Gridicon
					key={ 'star-' + i }
					icon="star"
					style={ starStyles }
				/>
			);
		}
		return stars;
	},

	outlineStars: function() {
		const stars = [];
		let i;
		const roundRating = Math.round( this.props.rating / 10 ) * 10;
		const inverseRating = 100 - roundRating;
		const outlineCount = Math.floor( inverseRating / 20 );
		const starStyles = {
			width: this.props.size
				? this.props.size + 'px'
				: '24px',
			height: this.props.size
				? this.props.size + 'px'
				: '24px'
		};

		for ( i = 1; i < 6; i++ ) {
			let outlineStyles = { fill: '#00aadc' };
			if ( inverseRating / 20 >= 1 ) {
				if ( i > ( 5 - outlineCount ) ) {
					outlineStyles = {
						fill: '#c8d7e1',
					};
				}
			}
			const allStyles = Object.assign( {}, starStyles, outlineStyles );

			stars.push(
				<Gridicon
					key={ 'outline-' + i }
					icon="star-outline"
					className={ 'outline-' + i }
					style={ allStyles }
				/>
			);
		}

		return stars;
	},

	render: function() {
		const ratingStyles = {
			width: ( this.props.size * 5 ) + 'px'
		};

		const roundRating = Math.round( this.props.rating / 10 ) * 10;
		const ratingWidth = ( this.props.size * 5 );
		const maskPosition = ( ( roundRating / 100 ) * ratingWidth ) + 'px';
		const clipPathMaskPosition = ( ratingWidth - ( ( roundRating / 100 ) * ratingWidth ) ) + 'px';
		const overlayHeightPx = ( this.props.size ) + 'px';
		const overlayStyles = {
			WebkitClipPath: 'inset(0 ' + clipPathMaskPosition + ' 0 0 )',
			clipPath: 'inset(0 ' + clipPathMaskPosition + ' 0 0 )',
			clip: 'rect(0, ' + maskPosition + ', ' + overlayHeightPx + ', 0)',
			width: ( this.props.size * 5 ) + 'px'
		};

		return (
			<div className="rating" style={ ratingStyles }>
				<div className="rating__overlay" style={ overlayStyles }>
					{ this.overlayStars() }
				</div>
				<div className="rating__star-outline">
					{ this.outlineStars() }
				</div>
			</div>
		);
	}
} );
