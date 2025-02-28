import { ProgressBar } from '@automattic/components';
import { localize, getLocaleSlug, numberFormat } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Rating from 'calypso/components/rating';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

import './style.scss';

const ratingTiers = [ 5, 4, 3, 2, 1 ];

class PluginRatings extends Component {
	static propTypes = {
		rating: PropTypes.number,
		ratings: PropTypes?.oneOfType( [ PropTypes.object, PropTypes.array ] ),
		downloaded: PropTypes?.number,
		slug: PropTypes?.string,
		numRatings: PropTypes?.number,
	};

	buildReviewUrl( ratingTier ) {
		const { slug } = this.props;
		return `https://wordpress.org/support/plugin/${ slug }/reviews/?filter=${ ratingTier }`;
	}

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
	}

	renderRatingTier = ( ratingTier ) => {
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
	};

	renderDownloaded() {
		let downloaded = this.props.downloaded;
		if ( downloaded > 100000 ) {
			downloaded = numberFormat( Math.floor( downloaded / 10000 ) * 10000 ) + '+';
		} else if ( downloaded > 10000 ) {
			downloaded = numberFormat( Math.floor( downloaded / 1000 ) * 1000 ) + '+';
		} else {
			downloaded = numberFormat( downloaded );
		}

		return (
			<div className="plugin-ratings__downloads">
				{ this.props.translate( '%(installs)s downloads', {
					args: { installs: downloaded },
				} ) }
			</div>
		);
	}

	render() {
		const {
			placeholder,
			ratings,
			rating,
			numRatings,
			inlineNumRatings,
			downloaded,
			hideRatingNumber,
		} = this.props;

		if ( placeholder ) {
			return this.renderPlaceholder();
		}

		const tierViews = ratings && ratingTiers.map( this.renderRatingTier );
		return (
			<div className="plugin-ratings">
				<div className="plugin-ratings__rating-stars">
					<Rating rating={ rating } />
					{ inlineNumRatings && numRatings && (
						<span className="plugin-ratings__num-ratings">
							(
							{ Number.isInteger( numRatings )
								? numRatings.toLocaleString( getLocaleSlug() )
								: null }
							)
						</span>
					) }
					{ ! hideRatingNumber && rating > 0 && (
						<span className="plugin-ratings__number">
							{ numberFormat( rating / 20, { decimals: 1 } ) }
						</span>
					) }
				</div>
				{ ! inlineNumRatings && numRatings && (
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
				) }
				{ tierViews && <div className="plugin-ratings__rating-tiers">{ tierViews }</div> }
				{ downloaded && this.renderDownloaded() }
			</div>
		);
	}
}

export default localize( PluginRatings );
