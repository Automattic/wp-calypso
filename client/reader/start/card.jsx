// External dependencies
import React from 'react';
import { connect } from 'react-redux';
import debugModule from 'debug';
import get from 'lodash/get';
import classnames from 'classnames';

// Internal dependencies
import Card from 'components/card';
import StartPostPreview from './post-preview';
import StartCardHero from './card-hero';
import StartCardHeader from './card-header';
import StartCardFooter from './card-footer';
import { getRecommendationById } from 'state/reader/start/selectors';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const StartCard = ( { siteId, postId } ) => {
	const cardClasses = classnames(
		'reader-start-card',
		{
			'has-post-preview': ( postId > 0 )
		}
	);

	return (
		<Card className={ cardClasses }>
			<StartCardHero siteId={ siteId } postId={ postId } />
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
		const recommendation = getRecommendationById( state, ownProps.recommendationId );
		const siteId = get( recommendation, 'recommended_site_ID' );
		const postId = get( recommendation, 'recommended_post_ID' );

		return {
			siteId,
			postId
		};
	}
)( StartCard );
