/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { PureComponent, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class EditorRevisionsListHeader extends PureComponent {
	render() {
		return (
			<div className="editor-revisions-list__header">
				<h3>
					{ this.props.translate( "You're seeing a past revision" ) }
				</h3>
				<Button
					className="editor-revisions-list__load-revision"
					onClick={ this.props.loadRevision }
					compact={ true }
				>
					{ this.props.translate( 'Load revision in the editor' ) }
				</Button>
			</div>
		);
	}
}

EditorRevisionsListHeader.propTypes = {
	loadRevision: PropTypes.func,
	translate: PropTypes.func,
};

export default localize( EditorRevisionsListHeader );
