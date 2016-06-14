/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import map from 'lodash/map';
import page from 'page';
import Masonry from 'react-masonry-component';

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

	// Remove change listeners from stores
	componentWillUnmount() {
		FeedSubscriptionStore.off( 'change', this.handleChange );
	},

	getStateFromStores() {
		return {
			totalSubscriptions: FeedSubscriptionStore.getTotalSubscriptions()
		};
	},

	handleChange() {
		this.smartSetState( this.getStateFromStores() );
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
					<h1 className="reader-start__title">{ this.translate( 'Welcome to the WordPress.com Reader' ) }</h1>
					<p className="reader-start__description">{ this.translate( "Discover great stories and read your favorite sites' posts all in one place. Every time there are new updates to the sites you follow, you'll be the first to know!" ) }</p>
					<p className="reader-start__description">{ this.translate( "We've suggested some sites below that you might enjoy. Follow one or more sites to get started." ) }</p>
				</header>

				<Masonry className="reader-start__cards" options={ { gutter: 14 } }>
					{ this.props.recommendationIds ? map( this.props.recommendationIds, ( recId ) => {
						return (
							<StartCard
								key={ 'start-card-rec' + recId }
								recommendationId={ recId } />
						);
					} ) : null }
				</Masonry>

				<RootChild className="reader-start__bar">
					<div className="reader-start__bar-action main">
						<span className="reader-start__bar-text">
							{ canGraduate
								? this.translate(
									'Great! You\'re now following %(totalSubscriptions)d site.',
									'Great! You\'re now following %(totalSubscriptions)d sites.', {
										count: this.state.totalSubscriptions,
										args: {
											totalSubscriptions: this.state.totalSubscriptions
										}
									}
								)
								: this.translate( 'Follow one or more sites to get started' )
							}
						</span>
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
