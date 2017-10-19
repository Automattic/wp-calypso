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
import { recordTracksEvent } from 'state/analytics/actions';
import {
	NESTED_SIDEBAR_NONE,
	NESTED_SIDEBAR_REVISIONS,
	NestedSidebarPropType,
} from 'post-editor/editor-sidebar/constants';

class HistoryButton extends PureComponent {
	toggleShowing = () => {
		const {
			isSidebarOpened,
			nestedSidebar,
			selectRevision,
			setNestedSidebar,
			toggleSidebar,
		} = this.props;

		// hide revisions if visible
		if ( nestedSidebar === NESTED_SIDEBAR_REVISIONS ) {
			setNestedSidebar( NESTED_SIDEBAR_NONE );
			return;
		}

		// otherwise, show revisions...
		this.trackPostRevisionsOpen();
		selectRevision( null );
		setNestedSidebar( NESTED_SIDEBAR_REVISIONS );

		// and open the sidebar if it's not open already.
		if ( ! isSidebarOpened ) {
			toggleSidebar();
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

HistoryButton.PropTypes = {
	isSidebarOpened: PropTypes.bool,
	nestedSidebar: NestedSidebarPropType,
	selectRevision: PropTypes.func,
	setNestedSidebar: PropTypes.func,
	toggleSidebar: PropTypes.func,
	translate: PropTypes.func,
};

export default flow( localize, connect( null, { recordTracksEvent } ) )( HistoryButton );
