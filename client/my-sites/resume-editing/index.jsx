import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import QueryPosts from 'calypso/components/data/query-posts';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { decodeEntities } from 'calypso/lib/formatting';
import { resetEditorLastDraft } from 'calypso/state/editor/last-draft/actions';
import {
	getEditorLastDraftPost,
	getEditorLastDraftSiteId,
	getEditorLastDraftPostId,
} from 'calypso/state/editor/last-draft/selectors';
import { getEditorPath } from 'calypso/state/editor/selectors';
import { isRequestingSitePost } from 'calypso/state/posts/selectors';

import './style.scss';

class ResumeEditing extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		requesting: PropTypes.bool,
		draft: PropTypes.object,
		editPath: PropTypes.string,
		translate: PropTypes.func,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
		const { siteId, postId, requesting, draft, editPath, translate } = this.props;
		if ( ! draft ) {
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
		};
	},
	{ resetEditorLastDraft }
)( localize( ResumeEditing ) );
