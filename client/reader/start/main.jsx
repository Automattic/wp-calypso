// External dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import Main from 'components/main';

const Start = React.createClass( {
	render() {
		return (
			<Main className="reader-start">
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
			recommendations: {}
		};
	}
)( Start );
