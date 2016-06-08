/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import map from 'lodash/map';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getRecommendationIds } from 'state/reader/start/selectors';
import QueryReaderStartRecommendations from 'components/data/query-reader-start-recommendations';
import Button from 'components/button';
import StartCard from './card';
import RootChild from 'components/root-child';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';
import smartSetState from 'lib/react-smart-set-state';

const Start = React.createClass( {

	smartSetState: smartSetState,

	getInitialState() {
		return {
			totalSubscriptions: 0
		};
	},

	// Add change listeners to stores
	componentDidMount() {
		FeedSubscriptionStore.on( 'change', this.handleChange );
	},

	// Remove change listers from stores
	componentWillUnmount() {
		FeedSubscriptionStore.off( 'change', this.handleChange );
	},

	getStateFromStores() {
		return {
			totalSubscriptions: FeedSubscriptionStore.getTotalSubscriptions()
		};
	},

	handleChange() {
		this.setState( this.getStateFromStores() );
	},

	graduateColdStart() {
		// Later, we'll store that the user has graduated Cold Start, so they won't see it again.
		// For the moment, just redirect to the following stream.
		page.redirect( '/' );
	},

	render() {
		const canGraduate = ( this.state.totalSubscriptions > 0 );

		return (
			<Main className="reader-start">
				<QueryReaderStartRecommendations />
				<header className="reader-start__intro">
					<h1 className="reader-start__title">{ this.translate( 'Welcome to the Reader' ) }</h1>
					<p className="reader-start__description">{ this.translate( "Discover great stories and read your favorite sites' posts all in one place. Every time there are new updates to the sites you follow, you'll be the first to know!" ) }
				</p>
				</header>

				<div className="reader-start__cards">
					{ this.props.recommendationIds ? map( this.props.recommendationIds, ( recId ) => {
						return (
							<StartCard
								key={ 'start-card-rec' + recId }
								recommendationId={ recId } />
						);
					} ) : null }
				</div>

				<RootChild className="reader-start__bar">
					<div className="reader-start__bar-action main">
						<span className="reader-start__bar-text">{ this.translate( 'Follow one or more sites to get started' ) }</span>
						<Button onClick={ this.graduateColdStart } disabled={ ! canGraduate }>{ this.translate( "OK, I'm all set!" ) }</Button>
					</div>
				</RootChild>
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			recommendationIds: getRecommendationIds( state )
		};
	}
)( Start );
