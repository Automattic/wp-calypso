// External dependencies
import React from 'react';
import debugModule from 'debug';
import { connect } from 'react-redux';

// Internal dependencies
import Main from 'components/main';
import Button from 'components/button';
import ReaderStartCard from './card';
import QueryReaderStartRecommendations from 'components/data/query-reader-start-recommendations';
import { getRecommendations } from 'state/reader/start/selectors';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const ReaderStart = React.createClass( {
	render() {
		debug( this.props.recommendations );
		return (
			<Main className="reader-start">
				<header>
					<h2>{ this.translate( 'Welcome to the Reader' ) }</h2>
					<Button disabled primary>{ this.translate( "OK, I'm all set!" ) }</Button>
				</header>
				<p>{ this.translate( "Discover great stories and read your favourite sites' posts all in one place." ) }&nbsp;
				{ this.translate( "Every time there are new updates to the sites you follow, you'll be the first to know!" ) }
				</p>

				<QueryReaderStartRecommendations />
				<div className="reader-start__cards">
					<ReaderStartCard />
					<ReaderStartCard />
					<ReaderStartCard />
				</div>
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			recommendations: getRecommendations( state )
		};
	}
)( ReaderStart );

