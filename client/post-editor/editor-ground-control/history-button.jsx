/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
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

		selectRevision( null );
		setNestedSidebar( NESTED_SIDEBAR_REVISIONS );

		// open the sidebar when closed
		if ( ! isSidebarOpened ) {
			toggleSidebar();
		}
	};

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

export default localize( HistoryButton );
