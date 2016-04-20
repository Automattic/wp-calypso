// External dependencies
import React from 'react';
import debugModule from 'debug';
import { connect } from 'react-redux';

// Internal dependencies
import Main from 'components/main';
import Button from 'components/button';
import Card from 'components/card';

const debug = debugModule( 'calypso:reader:start' ); //eslint-disable-line no-unused-vars

const ReaderStart = React.createClass( {
	render() {
		return (
			<Main className="reader-start">
				<header>
					<h2>{ this.translate( 'Add sites to my Reader' ) }</h2>
					<Button disabled primary>{ this.translate( "OK, I'm all set!" ) }</Button>
				</header>
				<p>{ this.translate( 'Follow these great new reads!' ) }</p>

				<Card>
					site card
				</Card>
				<Card>
					post card
				</Card>
			</Main>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		return {
			recommendations: {} //getColdStartRecommendations( state )
		};
	}
)( ReaderStart );
