/**
 * External depe;ndencies
 */
var React = require( 'react' );
/**
 * Internal dependencies
 */
var ProgressBar = require( 'components/progress-bar' ),
	analytics = require( 'analytics' );

/**
 * Constants
 */
const REVIEW_URL = 'https://wordpress.org/support/view/plugin-reviews/';

module.exports = React.createClass( {

	ratingTiers: [ 5, 4, 3, 2, 1 ],

	displayName: 'PluginRatings',

	getDefaultProps: function() {
		return { barWidth: 88 };
	},

	renderRatingTier: function( ratingTier ) {
		var amountOfRatings = ( this.props.plugin.ratings && this.props.plugin.ratings[ ratingTier ] ) ? this.props.plugin.ratings[ ratingTier ] : 0;
		return (
			<div className="plugin-ratings__rating-tier" key={ 'plugins-ratings__tier-' + ratingTier }>
				<a className="plugin-ratings__rating-container" target="_blank"
					onClick={ analytics.ga.recordEvent.bind( this, 'Plugins', 'Clicked Plugin Ratings Link', 'Plugin Name', this.props.pluginSlug ) }
					href={ REVIEW_URL + this.props.plugin.slug }>
					<span className="plugin-ratings__rating-tier-text"> { this.translate( '%(ratingTier)s stars', { args: { ratingTier: ratingTier } } ) } </span>
					<span className="plugin_ratings__bar">
						<ProgressBar value={ amountOfRatings }
									total={ this.props.plugin.num_ratings }
									title={ this.translate( '%(numberOfRatings)s ratings', { args: { numberOfRatings: amountOfRatings } } ) } />
					</span>
				</a>
			</div>
		);
	},

	renderDownloaded: function() {
		var downloaded = this.props.plugin.downloaded;
		if ( downloaded > 100000 ) {
			downloaded = this.numberFormat( Math.floor( downloaded / 10000 ) * 10000 ) + '+';
		} else if ( downloaded > 10000 ) {
			downloaded = this.numberFormat( Math.floor( downloaded / 1000 ) * 1000 ) + '+';
		} else {
			downloaded = this.numberFormat( downloaded );
		}

		return <div className="plugin-ratings__downloads"> { this.translate( '%(installs)s downloads', { args: { installs: downloaded } } ) } </div>;
	},

	render: function() {
		var tierViews;
		if ( ! this.props.plugin.ratings ) {
			return null;
		}

		tierViews = this.ratingTiers.map( function( tierLevel ) {
			return this.renderRatingTier( tierLevel );
		}, this );
		return (
			<div className="plugin-ratings">
				{ tierViews }
				{ this.renderDownloaded() }
			</div>
		);
	}
} );
