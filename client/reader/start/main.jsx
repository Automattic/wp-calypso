/**
 * External dependencies
 */
import React from 'react';
import debugModule from 'debug';
import { connect } from 'react-redux';
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getRecommendationIds } from 'state/reader/start/selectors';
import QueryReaderStartRecommendations from 'components/data/query-reader-start-recommendations';
import Button from 'components/button';
import StartCard from './card';
import RootChild from 'components/root-child';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const Start = React.createClass( {
	render() {
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
						<Button disabled>{ this.translate( "OK, I'm all set!" ) }</Button>
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
