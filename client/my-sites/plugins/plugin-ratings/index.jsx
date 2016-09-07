/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ProgressBar from 'components/progress-bar';
import Rating from 'components/rating';
import analytics from 'lib/analytics';

export default React.createClass( {
	displayName: 'PluginRatings',

	propTypes: {
		rating: React.PropTypes.number,
		ratings: React.PropTypes.object,
		downloaded: React.PropTypes.number,
		slug: React.PropTypes.string,
		numRatings: React.PropTypes.number
	},

	ratingTiers: [ 5, 4, 3, 2, 1 ],

	getDefaultProps() {
		return { barWidth: 88 };
	},

	buildReviewUrl( ratingTier ) {
		return `https://wordpress.org/support/plugin/${ this.props.slug }/reviews/?filter=${ ratingTier }`;
	},

	renderPlaceholder() {
		return (
			<div className="plugin-ratings is-placeholder">
				<div className="plugin-ratings__rating-stars">
					<Rating rating={ 0 } />
				</div>
				<div className="plugin-ratings__rating-text">{ this.translate( 'Based on' ) }</div>
			</div>
		);
	},

	renderRatingTier( ratingTier ) {
		const numberOfRatings = ( this.props.ratings && this.props.ratings[ ratingTier ] ) ? this.props.ratings[ ratingTier ] : 0;
		return (
			<div className="plugin-ratings__rating-tier" key={ `plugins-ratings__tier-${ ratingTier }` }>
				<a className="plugin-ratings__rating-container" target="_blank" rel="noopener noreferrer"
					onClick={ analytics.ga.recordEvent( 'Plugins', 'Clicked Plugin Ratings Link', 'Plugin Name', this.props.slug ) }
					href={ this.buildReviewUrl( ratingTier ) }
				>
					<span className="plugin-ratings__rating-tier-text">
						{
							this.translate( '%(ratingTier)s stars', {
								args: { ratingTier: ratingTier }
							} )
						}
					</span>
					<span className="plugin_ratings__bar">
						<ProgressBar value={ numberOfRatings }
							total={ this.props.numRatings }
							title={ this.translate( '%(numberOfRatings)s ratings', { args: { numberOfRatings } } ) }
						/>
					</span>
				</a>
			</div>
		);
	},

	renderDownloaded() {
		let downloaded = this.props.downloaded;
		if ( downloaded > 100000 ) {
			downloaded = this.numberFormat( Math.floor( downloaded / 10000 ) * 10000 ) + '+';
		} else if ( downloaded > 10000 ) {
			downloaded = this.numberFormat( Math.floor( downloaded / 1000 ) * 1000 ) + '+';
		} else {
			downloaded = this.numberFormat( downloaded );
		}

		return (
			<div className="plugin-ratings__downloads">
				{
					this.translate( '%(installs)s downloads', {
						args: { installs: downloaded }
					} )
				}
			</div>
		);
	},

	render() {
		if ( this.props.placeholder ) {
			return this.renderPlaceholder();
		}

		if ( ! this.props.ratings ) {
			return null;
		}

		const tierViews = this.ratingTiers.map( tierLevel => this.renderRatingTier( tierLevel ) );
		return (
			<div className="plugin-ratings">
				<div className="plugin-ratings__rating-stars">
					<Rating rating={ this.props.rating } />
				</div>
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
