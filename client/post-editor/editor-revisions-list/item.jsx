import { TimeSince } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { selectPostRevision } from 'calypso/state/posts/revisions/actions';
import { getPostRevisionAuthor } from 'calypso/state/posts/revisions/authors/selectors';
import { isSingleUserSite } from 'calypso/state/sites/selectors';

class EditorRevisionsListItem extends PureComponent {
	selectRevision = () => {
		this.props.selectPostRevision( this.props.revision.id );
	};

	render() {
		const { authorName, revision, revisionChanges, isMultiUserSite, translate } = this.props;
		const added = get( revisionChanges, 'add', 0 );
		const removed = get( revisionChanges, 'del', 0 );
		const titles = {
			added:
				added &&
				translate( '%(changes)d word added', '%(changes)d words added', {
					args: { changes: added },
					count: added,
				} ),
			removed:
				removed &&
				translate( '%(changes)d word removed', '%(changes)d words removed', {
					args: { changes: removed },
					count: removed,
				} ),
		};

		return (
			<button
				className="editor-revisions-list__button"
				onClick={ this.selectRevision }
				type="button"
			>
				<span className="editor-revisions-list__date">
					<TimeSince date={ get( revision, 'post_modified_gmt' ) } dateFormat="lll" />
				</span>

				{ authorName && isMultiUserSite && (
					<span className="editor-revisions-list__author">{ authorName }</span>
				) }

				<div className="editor-revisions-list__changes">
					{ added > 0 && (
						<span
							className="editor-revisions-list__additions"
							aria-label={ titles.added }
							title={ titles.added }
						>
							<b>+</b>
							{ added }
						</span>
					) }

					{ removed > 0 && (
						<span
							className="editor-revisions-list__deletions"
							aria-label={ titles.removed }
							title={ titles.removed }
						>
							<b>-</b>
							{ removed }
						</span>
					) }

					{ added === 0 && removed === 0 && (
						<span className="editor-revisions-list__minor-changes">
							{ translate( 'minor', { context: 'post revisions: minor changes' } ) }
						</span>
					) }
				</div>
			</button>
		);
	}
}

EditorRevisionsListItem.propTypes = {
	postId: PropTypes.number,
	revision: PropTypes.object.isRequired,
	revisionChanges: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,

	// connected to state
	authorName: PropTypes.string,
	isMultiUserSite: PropTypes.bool.isRequired,

	// connected to dispatcher
	selectPostRevision: PropTypes.func.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default connect(
	( state, { revision, siteId } ) => ( {
		authorName: get(
			getPostRevisionAuthor( state, get( revision, 'post_author' ) ),
			'display_name',
			''
		),
		isMultiUserSite: ! isSingleUserSite( state, siteId ),
	} ),
	{ selectPostRevision }
)( localize( EditorRevisionsListItem ) );
