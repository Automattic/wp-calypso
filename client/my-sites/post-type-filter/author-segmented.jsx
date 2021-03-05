/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compact, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'calypso/components/gravatar';
import NavItem from 'calypso/components/section-nav/item';
import NavSegmented from 'calypso/components/section-nav/segmented';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';

const AuthorSegmented = ( { author, siteSlug, statusSlug, translate, user, type } ) => {
	const scopes = {
		me: translate( 'Me', { context: 'Filter label for posts list' } ),
		everyone: translate( 'Everyone', { context: 'Filter label for posts list' } ),
	};

	const basePath = type === 'page' ? '/pages' : '/posts';

	return (
		<NavSegmented label={ translate( 'Author', { context: 'Filter group label for segmented' } ) }>
			{ map( scopes, ( label, scope ) => {
				const isMe = 'me' === scope;
				const path = compact( [
					basePath,
					isMe ? 'my' : null,
					statusSlug?.toLowerCase(),
					siteSlug,
				] ).join( '/' );

				return (
					<NavItem key={ scope } path={ path } selected={ isMe === !! author }>
						{ label }
						{ isMe && <Gravatar size={ 16 } user={ user } /> }
					</NavItem>
				);
			} ) }
		</NavSegmented>
	);
};

AuthorSegmented.propTypes = {
	author: PropTypes.number,
	siteId: PropTypes.number,
	statusSlug: PropTypes.string,
	type: PropTypes.string,
	// Connected Props
	siteSlug: PropTypes.string,
	translate: PropTypes.func.isRequired,
	user: PropTypes.object,
};

export default connect( ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
	user: getCurrentUser( state ),
} ) )( localize( AuthorSegmented ) );
