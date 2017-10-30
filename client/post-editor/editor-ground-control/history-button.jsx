/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS } from 'state/ui/editor/sidebar/constants';
import {
	closeEditorSidebar,
	openEditorSidebar,
	setNestedSidebar,
} from 'state/ui/editor/sidebar/actions';
import { getNestedSidebarTarget } from 'state/ui/editor/sidebar/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class HistoryButton extends PureComponent {
	static propTypes = {
		// passed props
		isSidebarOpened: PropTypes.bool,
		selectRevision: PropTypes.func.isRequired,

		// connected props
		closeEditorSidebar: PropTypes.func.isRequired,
		nestedSidebarTarget: PropTypes.oneOf( [ NESTED_SIDEBAR_NONE, NESTED_SIDEBAR_REVISIONS ] ),
		openEditorSidebar: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		setNestedSidebar: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	toggleShowing = () => {
		const { isSidebarOpened, nestedSidebarTarget, selectRevision } = this.props;
		// hide revisions if shown
		if ( nestedSidebarTarget === NESTED_SIDEBAR_REVISIONS ) {
			this.props.setNestedSidebar( NESTED_SIDEBAR_NONE );
			return;
		}

		// otherwise, show revisions...
		this.trackPostRevisionsOpen();
		selectRevision( null );
		this.props.setNestedSidebar( NESTED_SIDEBAR_REVISIONS );

		if ( ! isSidebarOpened ) {
			this.props.openEditorSidebar();
		}
	};

	trackPostRevisionsOpen() {
		this.props.recordTracksEvent( 'calypso_editor_post_revisions_open', {
			source: 'ground_control_history',
		} );
	}

	render() {
		return (
			<div className="editor-ground-control__history">
				<button
					className="editor-ground-control__save button is-link"
					onClick={ this.toggleShowing }
				>
					{ this.props.translate( 'History' ) }
				</button>
			</div>
		);
	}
}

export default flow(
	localize,
	connect(
		state => ( {
			nestedSidebarTarget: getNestedSidebarTarget( state ),
		} ),
		{
			recordTracksEvent,
			closeEditorSidebar,
			openEditorSidebar,
			setNestedSidebar,
		}
	)
)( HistoryButton );
