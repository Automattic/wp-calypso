/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { NESTED_SIDEBAR_REVISIONS } from 'post-editor/editor-sidebar/constants';

class EditorRevisions extends Component {
	showRevisionsNestedSidebar = () => {
		this.props.setNestedSidebar( NESTED_SIDEBAR_REVISIONS );
	}

	render() {
		const { adminUrl, revisions, translate } = this.props;

		if ( ! revisions || ! revisions.length ) {
			return null;
		}

		if ( isEnabled( 'post-editor/revisions' ) ) {
			return (
				<button
					className="editor-revisions"
					title={ translate( 'Open list of revisions' ) }
					onClick={ this.showRevisionsNestedSidebar }
				>
					<Gridicon icon="history" size={ 18 } />
					{ translate(
						'%(revisions)d revision',
						'%(revisions)d revisions', {
							count: revisions.length,
							args: { revisions: revisions.length },
						}
					) }
				</button>
			);
		}

		const lastRevision = revisions[ 0 ];
		const revisionsLink = adminUrl + 'revision.php?revision=' + lastRevision;
		return (
			<a
				className="editor-revisions"
				href={ revisionsLink }
				target="_blank"
				rel="noopener noreferrer"
				aria-label={ translate( 'Open list of revisions' ) }
			>
				<Gridicon icon="history" size={ 18 } />
				{ translate(
					'%(revisions)d revision',
					'%(revisions)d revisions', {
						count: revisions.length,
						args: { revisions: revisions.length },
					}
				) }
			</a>
		);
	}
}

EditorRevisions.propTypes = {
	adminUrl: PropTypes.string,
	revisions: PropTypes.array,
	translate: PropTypes.func,
	setNestedSidebar: PropTypes.func,
};

export default localize( EditorRevisions );
