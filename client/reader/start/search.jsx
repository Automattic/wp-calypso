// External dependencies
import React from 'react';

// Internal dependencies
import SearchStream from 'reader/search-stream';
import { localize } from 'i18n-calypso';

const StartSearch = React.createClass( {
	render() {
		return (
			<div className="start__search">
				<SearchStream
					showBlankContent={ false }
					searchPlaceholderText={ this.props.translate( 'What are you really into?' ) }
				/>
			</div>
		);
	}
} );

export default localize( StartSearch );
