/**
 * External dependencies
 */
import React from 'react';

module.exports = React.createClass( {

	displayName: 'Rating',

	getDefaultProps: function() {
		return { rating: 0 };
	},

	propTypes: {
		rating: React.PropTypes.number,
		size: React.PropTypes.number
	},

	getStars: function() {
		let i,
			stars = [],
			ratingOverTen = Math.ceil( this.props.rating / 10 ),
			numberOfStars = Math.floor( ratingOverTen / 2 ),
			hasHalfStar = ( ( ratingOverTen / 2 ) % 1 >= 0.5 ),
			starStyles = {
				fontSize: this.props.size
					? this.props.size + 'px'
					: 'inherit'
			};

		for ( i = 0; i < numberOfStars; i++ ) {
			stars.push(
				<span
					key={ 'star_' + i }
					className="noticon noticon-rating-full"
					style={ starStyles }
				/>
			);
		}

		if ( hasHalfStar ) {
			stars.push(
				<span
					key="halfstar"
					className="noticon noticon-rating-half"
					style={ starStyles }
				/>
			);
		}

		while ( stars.length < 5 ) {
			stars.push(
				<span
					key={ 'empty_' + stars.length }
					className="noticon noticon-rating-empty"
					style={ starStyles }
				/>
			);
		}

		return stars;
	},

	render: function() {
		const ratingStyles = {
			width: this.props.size
				? ( this.props.size * 5 ) + 'px'
				: '100%'
		};

		return (
			<div className="rating" style={ ratingStyles }>
				{ this.getStars() }
			</div>
		);
	}
} );
