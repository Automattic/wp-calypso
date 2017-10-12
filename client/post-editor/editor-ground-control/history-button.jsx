/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	NESTED_SIDEBAR_NONE,
	NESTED_SIDEBAR_REVISIONS,
} from 'post-editor/editor-sidebar/constants';

class HistoryButton extends PureComponent {
	state = {
		showingHistory: false,
	};

	toggleShowing = () => {
		this.setState( {
			showingHistory: ! this.state.showingHistory,
		} );
	};

	componentWillUpdate( nextProps, nextState ) {
		if ( nextState.showingHistory === this.state.showingHistory ) {
			return;
		}

		const { selectRevision, setNestedSidebar } = this.props;

		selectRevision( null );

		if ( nextState.showingHistory ) {
			setNestedSidebar( NESTED_SIDEBAR_REVISIONS );
			return;
		}
		setNestedSidebar( NESTED_SIDEBAR_NONE );
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

export default localize( HistoryButton );
