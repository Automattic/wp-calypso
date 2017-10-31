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
import { editPost } from 'state/posts/actions';
import { getPostRevision } from 'state/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { edit as libPostsEdit } from 'lib/posts/actions';
import { isWithinBreakpoint } from 'lib/viewport';
import { localize } from 'i18n-calypso';
import Button from 'components/button';

class LoadButton extends PureComponent {
	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		selectedRevisionId: PropTypes.number,
	};

	loadRevision = () => {
		const { revision /*, siteId, postId, selectedRevisionId*/ } = this.props;
		//		console.log( { loading: 'libPostsEdit', siteId, postId, revision, selectedRevisionId } );
		libPostsEdit( {
			content: revision.content,
			excerpt: revision.excerpt,
			title: revision.title,
		} );

		if ( isWithinBreakpoint( '<660px' ) ) {
			this.props.setLayoutFocus( 'content' );
		}

		this.props.recordTracksEvent( 'calypso_editor_post_revisions_load_revision' );
	};

	render() {
		return <Button onClick={ this.loadRevision }>{ this.props.translate( 'Load' ) }</Button>;
	}
}
export default flow(
	localize,
	connect(
		( state, { siteId, postId, selectedRevisionId } ) => ( {
			revision: getPostRevision( state, siteId, postId, selectedRevisionId, 'display' ),
		} ),
		{
			editPost,
			recordTracksEvent,
			setLayoutFocus,
		}
	)
)( LoadButton );
