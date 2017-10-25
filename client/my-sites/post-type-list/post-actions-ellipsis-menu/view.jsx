/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'components/popover/menu-item';
import { bumpStat as bumpAnalyticsStat } from 'state/analytics/actions';
import { bumpStatGenerator } from './utils';
import { getPost, getPostPreviewUrl } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { isSitePreviewable } from 'state/sites/selectors';
import { setPreviewUrl } from 'state/ui/preview/actions';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

class PostActionsEllipsisMenuView extends Component {
	static propTypes = {
		globalId: PropTypes.string,
		translate: PropTypes.func.isRequired,
		status: PropTypes.string,
		isPreviewable: PropTypes.bool,
		onClick: PropTypes.func,
		previewUrl: PropTypes.string,
		setPreviewUrl: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		bumpStat: PropTypes.func,
	};

	static defaultProps = {
		globalId: '',
		status: 'draft',
		isPreviewable: false,
		onClick: () => {},
		previewUrl: '',
	};

	previewPost = event => {
		const { isPreviewable, previewUrl } = this.props;
		this.props.bumpStat();
		if ( ! isPreviewable ) {
			return;
		}

		this.props.setPreviewUrl( previewUrl );
		this.props.setLayoutFocus( 'preview' );
		this.props.onClick();
		event.preventDefault();
	};

	render() {
		const { translate, status, previewUrl } = this.props;
		if ( ! previewUrl ) {
			return null;
		}

		return (
			<PopoverMenuItem
				href={ previewUrl }
				onClick={ this.previewPost }
				icon="visible"
				target="_blank"
				rel="noopener noreferrer"
			>
				{ includes( [ 'publish', 'private' ], status ) ? (
					translate( 'View', { context: 'verb' } )
				) : (
					translate( 'Preview', { context: 'verb' } )
				) }
			</PopoverMenuItem>
		);
	}
}

const mapStateToProps = ( state, { globalId } ) => {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return {};
	}

	return {
		status: post.status,
		isPreviewable: false !== isSitePreviewable( state, post.site_ID ),
		previewUrl: getPostPreviewUrl( state, post.site_ID, post.ID ),
		type: getPostType( state, post.site_ID, post.type ),
	};
};

const mapDispatchToProps = { setPreviewUrl, setLayoutFocus, bumpAnalyticsStat };

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const bumpStat = bumpStatGenerator(
		stateProps.type.name,
		'view',
		dispatchProps.bumpAnalyticsStat
	);
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { bumpStat } );
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )(
	localize( PostActionsEllipsisMenuView )
);
