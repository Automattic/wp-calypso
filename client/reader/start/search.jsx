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
					{ ...this.props }
					store={ this.props.feedStore }
					showBlankContent={ false }
					showPrimaryFollowButtonOnCards={ true }
					showBack={ false }
					showMobileBackToSidebar={ false }
					searchPlaceholderText={ this.props.translate( 'What are you really into?' ) }
				/>
			</div>
		);
	}
} );

export default localize( StartSearch );
