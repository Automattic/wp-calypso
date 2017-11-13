/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { loadPostRevision } from 'state/posts/revisions/actions';
import { getPostRevisionsSelectedRevision } from 'state/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
//import libPostsActions from 'lib/posts/actions';
import { isWithinBreakpoint } from 'lib/viewport';
import { localize } from 'i18n-calypso';
import Button from 'components/button';

class LoadButton extends PureComponent {
	static propTypes = {
		// connected to state
		postId: PropTypes.number,
		revision: PropTypes.object,
		siteId: PropTypes.number,
	};

	loadRevision = () => {
		const { revision, postId, siteId } = this.props;

		this.props.loadPostRevision( { revision, postId, siteId }, () => {
			if ( isWithinBreakpoint( '<660px' ) ) {
				this.props.setLayoutFocus( 'content' );
			}
		} );

		/*
		This is not working. Figure out why or rewrite

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		libPostsActions.edit( {
			content: revision.content,
			excerpt: revision.excerpt,
			title: revision.title,
		} );*/

		this.props.recordTracksEvent( 'calypso_editor_post_revisions_load_revision' );
	};

	render() {
		const { revision, postId, siteId } = this.props;
		const disabled = ! ( revision && postId && siteId );

		return (
			<Button primary onClick={ this.loadRevision } disabled={ disabled }>
				{ this.props.translate( 'Load' ) }
			</Button>
		);
	}
}
export default flow(
	localize,
	connect(
		state => ( {
			postId: getEditorPostId( state ),
			revision: getPostRevisionsSelectedRevision( state ),
			siteId: getSelectedSiteId( state ),
		} ),
		{
			loadPostRevision,
			recordTracksEvent,
			setLayoutFocus,
		}
	)
)( LoadButton );
