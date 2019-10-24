/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenuItemClipboard from 'components/popover/menu-item-clipboard';
import { getPost } from 'state/posts/selectors';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';

function PostActionsEllipsisMenuCopyLink( { onCopyLinkClick, copyLink, translate } ) {
	return (
		<PopoverMenuItemClipboard text={ copyLink } onCopy={ onCopyLinkClick }>
			{ translate( 'Copy Link', { context: 'verb' } ) }
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
	};
};

const mapDispatchToProps = { bumpStat, recordTracksEvent };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpCopyLinkStat = bumpStatGenerator( stateProps.type, 'copyLink', dispatchProps.bumpStat );
	const onCopyLinkClick = () => {
		bumpCopyLinkStat();
		dispatchProps.recordTracksEvent( 'calypso_post_type_list_permalink' );
	};
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { onCopyLinkClick } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( PostActionsEllipsisMenuCopyLink ) );
