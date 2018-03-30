/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import {
	splitPostRevisionsDiffView,
	unifyPostRevisionsDiffView,
} from 'state/posts/revisions/actions';
import { getPostRevisionsDiffView } from 'state/selectors';

const EditorRevisionsListViewButtons = ( { translate, diffView, viewSplit, viewUnified } ) => {
	return (
		<SegmentedControl compact className="editor-revisions-list__view-buttons">
			<ControlItem
				className="editor-revisions-list__unified-button"
				onClick={ viewUnified }
				selected={ diffView === 'unified' }
			>
				{ translate( 'Unified' ) }
			</ControlItem>
			<ControlItem
				className="editor-revisions-list__split-button"
				onClick={ viewSplit }
				selected={ diffView === 'split' }
			>
				{ translate( 'Split' ) }
			</ControlItem>
		</SegmentedControl>
	);
};

EditorRevisionsListViewButtons.propTypes = {
	viewSplit: PropTypes.func.isRequired,
	viewUnified: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

const mapStateToProps = state => ( {
	diffView: getPostRevisionsDiffView( state ),
} );

const mapDispatchToProps = dispatch => {
	return {
		viewUnified: () => {
			dispatch( unifyPostRevisionsDiffView() );
		},
		viewSplit: () => {
			dispatch( splitPostRevisionsDiffView() );
		},
	};
};

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( EditorRevisionsListViewButtons )
);
