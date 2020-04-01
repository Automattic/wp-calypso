/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

import createReactClass from 'create-react-class';

/**
 * Internal dependencies
 */
import { ProgressBar } from '@automattic/components';
import Rating from 'components/rating';
import { gaRecordEvent } from 'lib/analytics/ga';

/**
 * Style dependencies
 */
import './style.scss';

const PluginRatings = createReactClass( {
	displayName: 'PluginRatings',

	propTypes: {
		rating: PropTypes.number,
		ratings: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ),
		downloaded: PropTypes.number,
		slug: PropTypes.string,
		numRatings: PropTypes.number,
	},

	ratingTiers: [ 5, 4, 3, 2, 1 ],

	getDefaultProps() {
		return { barWidth: 88 };
	},

	buildReviewUrl( ratingTier ) {
		const { slug } = this.props;
		return `https://wordpress.org/support/plugin/${ slug }/reviews/?filter=${ ratingTier }`;
	},

	renderPlaceholder() {
		return (
			// eslint-disable-next-line
			<div className="plugin-ratings is-placeholder">
				<div className="plugin-ratings__rating-stars">
					<Rating rating={ 0 } />
				</div>
				<div className="plugin-ratings__rating-text">{ this.props.translate( 'Based on' ) }</div>
			</div>
		);
	},

	renderRatingTier( ratingTier ) {
		const { ratings, slug, numRatings } = this.props;
		const numberOfRatings = ratings && ratings[ ratingTier ] ? ratings[ ratingTier ] : 0;
		const onClickPluginRatingsLink = () => {
			gaRecordEvent( 'Plugins', 'Clicked Plugin Ratings Link', 'Plugin Name', slug );
		};

		return (
			<a
				className="plugin-ratings__rating-container"
				key={ `plugins-ratings__tier-${ ratingTier }` }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ onClickPluginRatingsLink }
				href={ this.buildReviewUrl( ratingTier ) }
			>
				<span className="plugin-ratings__rating-tier-text">
					{ this.props.translate( '%(ratingTier)s star', '%(ratingTier)s stars', {
						count: ratingTier,
						args: { ratingTier: ratingTier },
					} ) }
				</span>
				<span className="plugin-ratings__bar">
					<ProgressBar
						value={ numberOfRatings }
						total={ numRatings }
						title={ this.props.translate( '%(numberOfRatings)s ratings', {
							args: { numberOfRatings },
						} ) }
					/>
				</span>
			</a>
		);
	},

	renderDownloaded() {
		let downloaded = this.props.downloaded;
		if ( downloaded > 100000 ) {
			downloaded = this.props.numberFormat( Math.floor( downloaded / 10000 ) * 10000 ) + '+';
		} else if ( downloaded > 10000 ) {
			downloaded = this.props.numberFormat( Math.floor( downloaded / 1000 ) * 1000 ) + '+';
		} else {
			downloaded = this.props.numberFormat( downloaded );
		}

		return (
			<div className="plugin-ratings__downloads">
				{ this.props.translate( '%(installs)s downloads', {
					args: { installs: downloaded },
				} ) }
			</div>
		);
	},

	render() {
		const { placeholder, ratings, rating, numRatings } = this.props;

		if ( placeholder ) {
			return this.renderPlaceholder();
		}

		if ( ! ratings ) {
			return null;
		}

		const tierViews = this.ratingTiers.map( tierLevel => this.renderRatingTier( tierLevel ) );
		return (
			<div className="plugin-ratings">
				<div className="plugin-ratings__rating-stars">
					<Rating rating={ rating } />
				</div>
				<div className="plugin-ratings__rating-text">
					{ this.props.translate(
						'Based on %(ratingsNumber)s rating',
						'Based on %(ratingsNumber)s ratings',
						{
							count: numRatings,
							args: { ratingsNumber: numRatings },
						}
					) }
				</div>
				<div className="plugin-ratings__rating-tiers">{ tierViews }</div>
				{ this.renderDownloaded() }
			</div>
		);
	},
} );

export default localize( PluginRatings );
