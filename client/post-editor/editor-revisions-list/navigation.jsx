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

const EditorRevisionsListNavigation = ( { selectNextRevision, selectPreviousRevision } ) => {
	return (
		<ButtonGroup className="editor-revisions-list__navigation">
			<Button
				compact
				borderless
				className="editor-revisions-list__prev-button"
				type="button"
				onClick={ selectPreviousRevision }
			>
				<Gridicon icon="chevron-down" />
			</Button>
			<Button
				compact
				borderless
				className="editor-revisions-list__next-button"
				type="button"
				onClick={ selectNextRevision }
			>
				<Gridicon icon="chevron-up" />
			</Button>
		</ButtonGroup>
	);
};

EditorRevisionsListNavigation.propTypes = {
	selectNextRevision: PropTypes.func.isRequired,
	selectPreviousRevision: PropTypes.func.isRequired,
};

export default EditorRevisionsListNavigation;
