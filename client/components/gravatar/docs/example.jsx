/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import { getCurrentUser } from 'state/current-user/selectors';

function GravatarExample( { currentUser } ) {
	return (
		<div className="design-assets__group">
			<h2>
				<a href="/devdocs/design/gravatar">Gravatar</a>
			</h2>
			<Gravatar user={ currentUser } size={ 96 } />
		</div>
	);
}

const ConnectedGravatarExample = connect( ( state ) => {
	const currentUser = getCurrentUser( state );

	if ( ! currentUser ) {
		return {};
	}

	return {
		currentUser
	};
} )( GravatarExample );

ConnectedGravatarExample.displayName = 'Gravatar';

export default ConnectedGravatarExample;
