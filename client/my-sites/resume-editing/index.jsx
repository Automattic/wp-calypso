/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { resetEditorLastDraft } from 'state/ui/editor/last-draft/actions';
import {
	getEditorLastDraftPost,
	getEditorLastDraftSiteId,
	getEditorLastDraftPostId
} from 'state/ui/editor/last-draft/selectors';
import { isRequestingSitePost } from 'state/posts/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getSectionName } from 'state/ui/selectors';
import { decodeEntities } from 'lib/formatting';
import analytics from 'lib/analytics';
import QueryPosts from 'components/data/query-posts';
import SiteIcon from 'components/site-icon';
import sitesList from 'lib/sites-list';
import Dispatcher from 'dispatcher';

/**
 * Module variables
 */
const sites = sitesList();

const ResumeEditing = React.createClass( {
	propTypes: {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		requesting: PropTypes.bool,
		draft: PropTypes.object,
		editPath: PropTypes.string,
		section: PropTypes.string,
		translate: PropTypes.func
	},

	componentWillReceiveProps( nextProps ) {
		// Once we start tracking a draft, monitor received changes for that
		// post to ensure we stop tracking if it's published or trashed
		// [TODO]: This becomes obsolete when we no longer rely on Flux for
		// tracking post data
		const { draft } = nextProps;
		if ( draft && ! this.dispatchToken ) {
			this.dispatchToken = Dispatcher.register( this.maybeStopTrackingDraft );
		} else if ( ! draft ) {
			this.unregisterDispatcher();
		}

		// If draft status is known and is not "draft", then assume it was
		// updated in global state and reset
		if ( 'draft' !== get( draft, 'status', 'draft' ) ) {
			nextProps.resetEditorLastDraft();
		}
	},

	componentWillUnmount() {
		this.unregisterDispatcher();
	},

	unregisterDispatcher() {
		if ( ! this.dispatchToken ) {
			return;
		}

		Dispatcher.unregister( this.dispatchToken );
		delete this.dispatchToken;
	},

	maybeStopTrackingDraft( payload ) {
		const { action } = payload;
		if ( 'RECEIVE_UPDATED_POST' !== action.type ) {
			return;
		}

		const { siteId, postId } = this.props;
		const { post } = action;
		if ( ! post || post.site_ID !== siteId || post.ID !== postId ) {
			return;
		}

		if ( 'draft' !== post.status ) {
			this.props.resetEditorLastDraft();
		}
	},

	trackAnalytics() {
		analytics.ga.recordEvent( 'Master Bar', 'Resumed Editing' );
		analytics.mc.bumpStat( 'calypso_edit_via', 'masterbar_resume_editing' );
	},

	render() {
		const { siteId, postId, requesting, draft, editPath, section, translate } = this.props;
		if ( ! draft || 'post-editor' === section ) {
			return null;
		}

		const classes = classnames( 'resume-editing', {
			'is-requesting': requesting
		} );

		return (
			<a href={ editPath } onClick={ this.trackAnalytics } className={ classes }>
				<QueryPosts siteId={ siteId } postId={ postId } />
				<span className="resume-editing__label">
					{ translate( 'Continue Editing' ) }
				</span>
				<span className="resume-editing__post-title">
					<SiteIcon size={ 16 } site={ sites.getSite( siteId ) } />
					{ draft.title ? decodeEntities( draft.title ) : translate( 'Untitled' ) }
				</span>
			</a>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getEditorLastDraftSiteId( state );
		const postId = getEditorLastDraftPostId( state );

		return {
			siteId,
			postId,
			requesting: isRequestingSitePost( state, siteId, postId ),
			draft: getEditorLastDraftPost( state ),
			editPath: getEditorPath( state, siteId, postId ),
			section: getSectionName( state )
		};
	},
	{ resetEditorLastDraft }
)( localize( ResumeEditing ) );
