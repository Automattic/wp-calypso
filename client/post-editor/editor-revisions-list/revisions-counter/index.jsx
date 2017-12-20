/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { noop, flow } from 'lodash';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import getPendingPostRevisionCount from 'state/selectors/get-pending-revisions-count';
import { loadPendingPostRevisions, selectPostRevision } from 'state/posts/revisions/actions';

class RevisionsCounter extends PureComponent {
	static propTypes = {
		pendingPostRevisionsCount: PropTypes.number,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		onClick: noop,
		pendingPostRevisionsCount: 0,
	};

	loadPendingRevisions = () => {
		const { postId, siteId, pendingPostRevisionsCount } = this.props;

		if ( ! pendingPostRevisionsCount ) {
			return;
		}

		this.props.loadPendingPostRevisions( {
			siteId,
			postId,
		} );

		// selectPostRevision here?
	};

	render() {
		const { pendingPostRevisionsCount, count, translate } = this.props;
		const classes = classnames( 'revisions-counter', {
			'revisions-counter__show-notification': !! pendingPostRevisionsCount,
		} );

		return (
			<div className={ classes }>
				{ count && <Count count={ count } /> }
				<div className="revisions-counter__notification" onClick={ this.loadPendingRevisions }>
					{ pendingPostRevisionsCount &&
						translate( '%s new', {
							args: pendingPostRevisionsCount,
						} ) }
				</div>
			</div>
		);
	}
}

export default flow(
	connect(
		state => {
			const postId = getEditorPostId( state );
			const siteId = getSelectedSiteId( state );
			const pendingPostRevisionsCount = getPendingPostRevisionCount( state, siteId, postId ) || 0;

			return {
				pendingPostRevisionsCount,
				siteId,
				postId,
			};
		},
		{ selectPostRevision, loadPendingPostRevisions }
	),
	localize
)( RevisionsCounter );
