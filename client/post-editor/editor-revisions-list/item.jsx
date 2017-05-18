/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { isObject } from 'lodash';
import React, { PureComponent, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import PostTime from 'reader/post-time';

class EditorRevisionsListItem extends PureComponent {
	selectRevision = event => {
		const revisionId = parseInt( event.currentTarget.dataset.revisionId, 10 );
		this.props.selectRevision( revisionId );
	}

	render() {
		return (
			<button
				className="editor-revisions-list__button"
				data-revision-id={ this.props.revision.id }
				onClick={ this.selectRevision }
				type="button"
			>
				<span className="editor-revisions-list__date">
					<PostTime date={ this.props.revision.date } />
				</span>
				&nbsp;
				<span className="editor-revisions-list__author">
					{ isObject( this.props.revision.author ) && (
						this.props.translate( 'by %(author)s', {
							args: { author: this.props.revision.author.display_name },
						} )
					) }
				</span>

				<div className="editor-revisions-list__changes">
					{ this.props.revision.changes.added > 0 && (
						<span className="editor-revisions-list__additions">
							{ this.props.translate(
								'%(changes)d word added',
								'%(changes)d words added',
								{
									args: { changes: this.props.revision.changes.added },
									count: this.props.revision.changes.added,
								}
							) }
						</span>
					) }

					{ this.props.revision.changes.added > 0 && this.props.revision.changes.removed > 0 && ', ' }

					{ this.props.revision.changes.removed > 0 && (
						<span className="editor-revisions-list__deletions">
							{ this.props.translate(
								'%(changes)d word removed',
								'%(changes)d words removed',
								{
									args: { changes: this.props.revision.changes.removed },
									count: this.props.revision.changes.removed,
								}
							) }
						</span>
					) }

					{ this.props.revision.changes.added === 0 && this.props.revision.changes.removed === 0 && (
						<span className="editor-revisions-list__minor-changes">
							{ this.props.translate( 'minor changes' ) }
						</span>
					) }
				</div>
			</button>
		);
	}
}

EditorRevisionsListItem.propTypes = {
	revision: PropTypes.object,
	selectRevision: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( EditorRevisionsListItem );
