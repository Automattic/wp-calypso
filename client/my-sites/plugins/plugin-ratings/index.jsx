/**
 * External depe;ndencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import ProgressBar from 'components/progress-bar';
import Rating from 'components/rating';
import analytics from 'lib/analytics';

/**
 * Constants
 */
const REVIEW_URL = 'https://wordpress.org/support/view/plugin-reviews/';

module.exports = React.createClass( {
	displayName: 'PluginRatings',

	propTypes: {
		rating: React.PropTypes.number,
		ratings: React.PropTypes.object,
		downloaded: React.PropTypes.number,
		slug: React.PropTypes.string,
		numRatings: React.PropTypes.number,
	},

	ratingTiers: [ 5, 4, 3, 2, 1 ],

	getDefaultProps: function() {
		return { barWidth: 88 };
	},

	renderPlaceholder: function() {
		return (
		<div className="plugin-ratings is-placeholder">
			<div className="plugin-ratings__rating-stars"><Rating rating={ 0 } /></div>
			<div className="plugin-ratings__rating-text">Based on</div>
		</div>
		);
	},

	renderRatingTier: function( ratingTier ) {
		var numberOfRatings = ( this.props.ratings && this.props.ratings[ ratingTier ] ) ? this.props.ratings[ ratingTier ] : 0;
		return (
			<div className="plugin-ratings__rating-tier" key={ 'plugins-ratings__tier-' + ratingTier }>
				<a className="plugin-ratings__rating-container" target="_blank" rel="noopener noreferrer"
					onClick={ analytics.ga.recordEvent.bind( this, 'Plugins', 'Clicked Plugin Ratings Link', 'Plugin Name', this.props.slug ) }
					href={ REVIEW_URL + this.props.slug }>
					<span className="plugin-ratings__rating-tier-text"> { this.translate( '%(ratingTier)s stars', { args: { ratingTier: ratingTier } } ) } </span>
					<span className="plugin_ratings__bar">
						<ProgressBar value={ numberOfRatings }
							total={ this.props.numRatings }
							title={ this.translate( '%(numberOfRatings)s ratings', { args: { numberOfRatings } } ) } />
					</span>
				</a>
			</div>
		);
	},

	renderDownloaded: function() {
		var downloaded = this.props.downloaded;
		if ( downloaded > 100000 ) {
			downloaded = this.numberFormat( Math.floor( downloaded / 10000 ) * 10000 ) + '+';
		} else if ( downloaded > 10000 ) {
			downloaded = this.numberFormat( Math.floor( downloaded / 1000 ) * 1000 ) + '+';
		} else {
			downloaded = this.numberFormat( downloaded );
		}

		return <div className="plugin-ratings__downloads">{ this.translate( '%(installs)s downloads', { args: { installs: downloaded } } ) }</div>;
	},

	render: function() {
		var tierViews;

		if ( this.props.placeholder ) {
			return this.renderPlaceholder();
		}

		if ( ! this.props.ratings ) {
			return null;
		}

		tierViews = this.ratingTiers.map( function( tierLevel ) {
			return this.renderRatingTier( tierLevel );
		}, this );
		return (
			<div className="plugin-ratings">
				<div className="plugin-ratings__rating-stars"><Rating rating={ this.props.rating } /></div>
				<div className="plugin-ratings__rating-text">
					{ this.translate( 'Based on %(ratingsNumber)s rating', 'Based on %(ratingsNumber)s ratings', {
						count: this.props.numRatings,
						args: { ratingsNumber: this.props.numRatings }
					} ) }
				</div>
				{ tierViews }
				{ this.renderDownloaded() }
			</div>
		);
	}
} );
