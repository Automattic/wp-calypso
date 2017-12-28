/** @format */

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
import Gravatar from 'client/components/gravatar';
import NavItem from 'client/components/section-nav/item';
import NavSegmented from 'client/components/section-nav/segmented';
import { getCurrentUser } from 'client/state/current-user/selectors';
import { getSiteSlug } from 'client/state/sites/selectors';

const AuthorSegmented = ( { author, siteSlug, statusSlug, translate, user } ) => {
	const scopes = {
		me: translate( 'Me', { context: 'Filter label for posts list' } ),
		everyone: translate( 'Everyone', { context: 'Filter label for posts list' } ),
	};

	return (
		<NavSegmented label={ translate( 'Author', { context: 'Filter group label for segmented' } ) }>
			{ map( scopes, ( label, scope ) => {
				const isMe = 'me' === scope;
				const path = compact( [ isMe ? '/posts/my' : '/posts', statusSlug, siteSlug ] ).join( '/' );

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
	// Connected Props
	siteSlug: PropTypes.string,
	translate: PropTypes.func.isRequired,
	user: PropTypes.object,
};

export default connect( ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
	user: getCurrentUser( state ),
} ) )( localize( AuthorSegmented ) );
