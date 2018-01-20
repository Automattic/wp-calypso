/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const EditorRevisionsListHeader = ( {
	numRevisions,
	translate,
	selectNextRevision,
	selectPreviousRevision,
} ) => {
	return (
		<div>
			<div className="editor-revisions-list__header">
				{ !! numRevisions &&
					translate( '%(revisions)d revision', '%(revisions)d revisions', {
						count: numRevisions,
						args: { revisions: numRevisions },
					} ) }
			</div>
			<div className="editor-revisions-list__navigation">
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
			</div>
		</div>
	);
};

EditorRevisionsListHeader.propTypes = {
	numRevisions: PropTypes.number.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default localize( EditorRevisionsListHeader );
