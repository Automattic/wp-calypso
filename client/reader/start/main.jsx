// External dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import Main from 'components/main';
import { getRecommendations } from 'state/reader/start/selectors';
import QueryReaderStartRecommendations from 'components/data/query-reader-start-recommendations';

const Start = React.createClass( {
	render() {
		return (
			<Main className="reader-start">
				<QueryReaderStartRecommendations />
				<header>
					<h2>{ this.translate( 'Welcome to the Reader' ) }</h2>
				</header>
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
)( Start );
