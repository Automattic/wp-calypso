/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { resetEditorLastDraft } from 'state/ui/editor/last-draft/actions';
import {
	getEditorLastDraftPost,
	getEditorLastDraftSiteId,
	getEditorLastDraftPostId,
} from 'state/ui/editor/last-draft/selectors';
import { isRequestingSitePost } from 'state/posts/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getSectionName } from 'state/ui/selectors';
import { decodeEntities } from 'lib/formatting';
import { gaRecordEvent } from 'lib/analytics/ga';
import { bumpStat } from 'lib/analytics/mc';
import QueryPosts from 'components/data/query-posts';
import SiteIcon from 'blocks/site-icon';

/**
 * Style dependencies
 */
import './style.scss';

class ResumeEditing extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		requesting: PropTypes.bool,
		draft: PropTypes.object,
		editPath: PropTypes.string,
		section: PropTypes.string,
		translate: PropTypes.func,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// Once we start tracking a draft, monitor received changes for that
		// post to ensure we stop tracking if it's published or trashed.
		if ( get( nextProps.draft, 'status', 'draft' ) !== 'draft' ) {
			nextProps.resetEditorLastDraft();
		}
	}

	trackAnalytics = () => {
		gaRecordEvent( 'Master Bar', 'Resumed Editing' );
		bumpStat( 'calypso_edit_via', 'masterbar_resume_editing' );
	};

	render() {
		const { siteId, postId, requesting, draft, editPath, section, translate } = this.props;
		if ( ! draft || 'post-editor' === section ) {
			return null;
		}

		const classes = classnames( 'resume-editing', {
			'is-requesting': requesting,
		} );

		return (
			<a href={ editPath } onClick={ this.trackAnalytics } className={ classes }>
				<QueryPosts siteId={ siteId } postId={ postId } />
				<span className="resume-editing__label">{ translate( 'Continue Editing' ) }</span>
				<span className="resume-editing__post-title">
					<SiteIcon size={ 16 } siteId={ siteId } />
					{ draft.title ? decodeEntities( draft.title ) : translate( 'Untitled' ) }
				</span>
			</a>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getEditorLastDraftSiteId( state );
		const postId = getEditorLastDraftPostId( state );

		return {
			siteId,
			postId,
			requesting: siteId && postId && isRequestingSitePost( state, siteId, postId ),
			draft: getEditorLastDraftPost( state ),
			editPath: getEditorPath( state, siteId, postId ),
			section: getSectionName( state ),
		};
	},
	{ resetEditorLastDraft }
)( localize( ResumeEditing ) );
