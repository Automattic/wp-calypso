/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { isObject } from 'lodash';
import React, { PureComponent, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PostTime from 'reader/post-time';

class EditorRevisionsListItem extends PureComponent {
	constructor() {
		super();
		this.toggleRevision = this.toggleRevision.bind( this );
	}

	toggleRevision( event ) {
		const revisionId = parseInt( event.currentTarget.dataset.revisionId, 10 );
		this.props.toggleRevision( revisionId );
	}

	render() {
		// FIXME: compute real changes
		const changes = { additions: 10, deletions: 10 };
		return (
			<Button
				borderless
				data-revision-id={ this.props.revision.id }
				onClick={ this.toggleRevision }
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
					{ changes.additions > 0 && (
						<span className="editor-revisions-list__additions">
							{ this.props.translate( '%(changes)d words added', {
								args: { changes: changes.additions },
							} ) }
						</span>
					) }

					{ changes.additions > 0 && changes.deletions > 0 && ', ' }

					{ changes.deletions > 0 && (
						<span className="editor-revisions-list__deletions">
							{ this.props.translate( '%(changes)d words removed', {
								args: { changes: changes.deletions },
							} ) }
						</span>
					) }
				</div>
			</Button>
		);
	}
}

EditorRevisionsListItem.propTypes = {
	revision: PropTypes.object,
	toggleRevision: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( EditorRevisionsListItem );
