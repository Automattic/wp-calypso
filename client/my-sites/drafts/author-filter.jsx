/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import { getCurrentUser } from 'state/current-user/selectors';

function DraftsAuthorFilter( { onChange, selectedScope, translate, user } ) {
	const scopes = [
		{
			id: 'me',
			caption: translate( 'Me', { context: 'Filter label for posts list' } ),
			showGravatar: true
		},
		{
			id: 'everyone',
			caption: translate( 'Everyone', { context: 'Filter label for posts list' } ),
			showGravatar: false
		}
	];

	return (
		<div className="drafts__author-filter">
			<NavSegmented
				label={ translate( 'Author', { context: 'Filter group label for segmented' } ) }
			>
				{ scopes.map( scope => {
					const selectScope = () => onChange( scope.id );

					return (
						<NavItem
							key={ 'authorSegmented' + scope.id }
							selected={ selectedScope === scope.id }
							onClick={ selectScope }
						>
							{ scope.caption }
							{ scope.showGravatar && <Gravatar size={ 16 } user={ user } /> }
						</NavItem>
					);
				} ) }
			</NavSegmented>
		</div>
	);
}

export default connect( state => {
	return {
		user: getCurrentUser( state )
	};
} )( localize( DraftsAuthorFilter ) );
