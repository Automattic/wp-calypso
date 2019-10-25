/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItemClipboard from 'components/popover/menu-item-clipboard';
import { getPost } from 'state/posts/selectors';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { infoNotice } from 'state/notices/actions';

function PostActionsEllipsisMenuCopyLink( { onCopyLinkClick, copyLink } ) {
	return (
		<PopoverMenuItemClipboard text={ copyLink } onCopy={ onCopyLinkClick } icon={ 'link' }>
			{ translate( 'Copy Link' ) }
		</PopoverMenuItemClipboard>
	);
}

PostActionsEllipsisMenuCopyLink.propTypes = {
	onCopyLinkClick: PropTypes.func,
	copyLink: PropTypes.string,
	translate: PropTypes.func,
};

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		copyLink: post.URL,
		type: post.type,
	};
};

const mapDispatchToProps = { bumpStat, infoNotice, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpCopyLinkStat = bumpStatGenerator( stateProps.type, 'copy_link', dispatchProps.bumpStat );
	const onCopyLinkClick = () => {
		dispatchProps.infoNotice( translate( 'Link copied to clipboard.' ), { duration: 3000 } );
		bumpCopyLinkStat();
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_copy_link' );
	};
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { onCopyLinkClick } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuCopyLink ) );
