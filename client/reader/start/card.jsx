// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import debugModule from 'debug';
import get from 'lodash/get';

// Internal dependencies
import Card from 'components/card';
import StartPostPreview from './post-preview';
import StartCardHeader from './card-header';
import StartCardFooter from './card-footer';
import { getRecommendationById } from 'state/reader/start/selectors';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const StartCard = ( { recommendation } ) => {
	const siteId = get( recommendation, 'recommended_site_ID' );
	const postId = get( recommendation, 'recommended_post_ID' );
	return (
		<Card className="reader-start-card">
			<div className="reader-start-card__hero"></div>
			<StartCardHeader siteId={ siteId } />
			{ postId > 0 && <StartPostPreview siteId={ siteId } postId={ postId } /> }
			<StartCardFooter siteId={ siteId } />
		</Card>
	);
};

StartCard.propTypes = {
	recommendationId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			recommendation: getRecommendationById( state, ownProps.recommendationId )
		};
	}
)( StartCard );
