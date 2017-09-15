/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compact, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import NavItem from 'components/section-nav/item';
import NavSegmented from 'components/section-nav/segmented';
import { areAllSitesSingleUser } from 'state/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { isJetpackSite, isSingleUserSite, getSiteSlug } from 'state/sites/selectors';

const AuthorSegmented = ( { author, isHidden, siteSlug, statusSlug, translate, user } ) => {
	if ( isHidden ) {
		return null;
	}

	const scopes = {
		me: translate( 'Me', { context: 'Filter label for posts list' } ),
		everyone: translate( 'Everyone', { context: 'Filter label for posts list' } )
	};

	return (
		<NavSegmented label={ translate( 'Author', { context: 'Filter group label for segmented' } ) }>
			{ map( scopes, ( label, scope ) => {
				const isMe = 'me' === scope;
				const path = compact( [
					isMe ? '/posts/my' : '/posts',
					statusSlug,
					siteSlug
				] ).join( '/' );

				return (
					<NavItem key={ scope }
						path={ path }
						selected={ isMe === !! author } >
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
	isHidden: PropTypes.bool,
	siteSlug: PropTypes.string,
	translate: PropTypes.func.isRequired,
	user: PropTypes.object,
};

export default connect(
	( state, { siteId } ) => {
		let isHidden = false;
		if ( siteId ) {
			isHidden = isSingleUserSite( state, siteId ) || isJetpackSite( state, siteId );
		} else {
			isHidden = areAllSitesSingleUser( state );
		}

		return {
			isHidden,
			siteSlug: getSiteSlug( state, siteId ),
			user: getCurrentUser( state )
		};
	}
)( localize( AuthorSegmented ) );
