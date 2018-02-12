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
	nextIsDisabled,
	prevIsDisabled,
	selectNextRevision,
	selectPreviousRevision,
	onNavButtonFocus,
} ) => {
	return (
		<ButtonGroup className="editor-revisions-list__navigation">
			<Button
				compact
				className="editor-revisions-list__prev-button"
				type="button"
				onClick={ selectPreviousRevision }
				disabled={ prevIsDisabled }
				onFocus={ onNavButtonFocus( 'prev' ) }
			>
				<Gridicon icon="chevron-down" />
			</Button>
			<Button
				compact
				className="editor-revisions-list__next-button"
				type="button"
				onClick={ selectNextRevision }
				disabled={ nextIsDisabled }
				onFocus={ onNavButtonFocus( 'next' ) }
			>
				<Gridicon icon="chevron-up" />
			</Button>
		</ButtonGroup>
	);
};

EditorRevisionsListNavigation.propTypes = {
	selectNextRevision: PropTypes.func.isRequired,
	selectPreviousRevision: PropTypes.func.isRequired,
	nextIsDisabled: PropTypes.bool,
	prevIsDisabled: PropTypes.bool,
	onNavButtonFocus: PropTypes.func,
};

export default EditorRevisionsListNavigation;
