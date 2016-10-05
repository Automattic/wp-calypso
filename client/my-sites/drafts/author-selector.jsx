/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import userLib from 'lib/user';
const user = userLib();

function AuthorSelector( { selectedScope, onChange } ) {
	const scopes = [
		{
			id: 'me',
			caption: i18n.translate( 'Me', { context: 'Filter label for posts list' } ),
			showGravatar: true
		},
		{
			id: 'everyone',
			caption: i18n.translate( 'Everyone', { context: 'Filter label for posts list' } ),
			showGravatar: false
		}
	];

	return (
		<div className="drafts__author-selector">
			<NavSegmented
				label={ i18n.translate( 'Author', { context: 'Filter group label for segmented' } ) }
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
							{ scope.showGravatar && <Gravatar size={ 16 } user={ user.get() } /> }
						</NavItem>
					);
				} ) }
			</NavSegmented>
		</div>
	);
}

export default AuthorSelector;
