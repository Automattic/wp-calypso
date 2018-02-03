/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';

const EditorRevisionsListNavigation = ( {
	latestRevisionIsSelected,
	earliestRevisionIsSelected,
	selectNextRevision,
	selectPreviousRevision,
} ) => {
	return (
		<ButtonGroup className="editor-revisions-list__navigation">
			<Button
				compact
				className="editor-revisions-list__prev-button"
				type="button"
				onClick={ selectPreviousRevision }
				disabled={ earliestRevisionIsSelected }
			>
				<Gridicon icon="chevron-down" />
			</Button>
			<Button
				compact
				className="editor-revisions-list__next-button"
				type="button"
				onClick={ selectNextRevision }
				disabled={ latestRevisionIsSelected }
			>
				<Gridicon icon="chevron-up" />
			</Button>
		</ButtonGroup>
	);
};

EditorRevisionsListNavigation.propTypes = {
	selectedRevisionOrder: PropTypes.string,
	selectNextRevision: PropTypes.func.isRequired,
	selectPreviousRevision: PropTypes.func.isRequired,
};

export default EditorRevisionsListNavigation;
