// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugModule from 'debug';
import get from 'lodash/get';
import classnames from 'classnames';

// Internal dependencies
import Card from 'components/card';
import StartPostPreview from './post-preview';
import StartCardHeader from './card-header';
import { recordRecommendationInteraction } from 'state/reader/start/actions';
import { getRecommendationById } from 'state/reader/start/selectors';
import { getPostBySiteAndId } from 'state/reader/posts/selectors';
import { recordTrack, recordTrackForPost, recordTracksRailcarInteract } from 'reader/stats';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const StartCard = React.createClass( {
	onCardInteraction() {
		this.props.recordRecommendationInteraction(
			this.props.recommendationId,
			this.props.recommendation.recommended_site_ID,
			this.props.recommendation.recommended_post_ID
		);

		if ( this.props.post ) {
			recordTrackForPost( 'calypso_reader_startcard_clicked', this.props.post );
		} else {
			recordTrack( 'calypso_reader_startcard_clicked', {
				blog_id: this.props.recommendation.recommended_site_ID,
				recommendation_id: this.props.recommendationId
			} );
			if ( this.props.recommendation.railcar ) {
				recordTracksRailcarInteract( 'startcard_clicked', this.props.recommendation.railcar );
			}
		}
	},

	render() {
		const { siteId, postId, post } = this.props;

		const cardClasses = classnames(
			'reader-start-card',
			{
				'has-post-preview': ( postId > 0 ),
				'is-photo': post && post.excerpt.length < 1
			}
		);

		return (
			<Card className={ cardClasses } onClick={ this.onCardInteraction }>
				<StartCardHeader siteId={ siteId } />
				{ postId > 0 && <StartPostPreview siteId={ siteId } postId={ postId } /> }
			</Card>
		);
	}
} );

StartCard.propTypes = {
	recommendationId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		const recommendation = getRecommendationById( state, ownProps.recommendationId );
		const siteId = get( recommendation, 'recommended_site_ID' );
		const postId = get( recommendation, 'recommended_post_ID' );

		const post = postId ? getPostBySiteAndId( state, siteId, postId ) : undefined;

		return {
			recommendation,
			siteId,
			postId,
			post
		};
	},
	( dispatch ) => bindActionCreators( {
		recordRecommendationInteraction
	}, dispatch )
)( StartCard );
