/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AuthorSelector from '../';
import Card from 'components/card';
import { getCurrentUser } from 'state/current-user/selectors';

function AuthorSelectorExample( { primarySiteId, displayName } ) {
	return (
		<div className="docs__design-assets-group">
			<h2>
				<a href="/devdocs/blocks/author-selector">Author Selector</a>
			</h2>
			<Card>
				<AuthorSelector
					siteId={ primarySiteId }
					allowSingleUser
					popoverPosition="bottom"
				>
					<span>You are { displayName } </span>
				</AuthorSelector>
			</Card>
		</div>
	);
}

const ConnectedAuthorSelectorExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return {};
	}

	return {
		primarySiteId: user.primary_blog,
		displayName: user.display_name
	};
} )( AuthorSelectorExample );

ConnectedAuthorSelectorExample.displayName = 'AuthorSelector';

export default ConnectedAuthorSelectorExample;
