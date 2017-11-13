/** @format */

/**
 * External dependencies
 */

import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

const EditorRevisionsListHeader = ( { numRevisions, translate } ) => {
	const classes = classNames( 'editor-revisions-list__header', {
		'editor-revisions-list__loading-placeholder': ! numRevisions,
	} );
	return (
		<div className={ classes }>
			{ !! numRevisions &&
				translate( '%(revisions)d revision', '%(revisions)d revisions', {
					count: numRevisions,
					args: { revisions: numRevisions },
				} ) }
		</div>
	);
};

EditorRevisionsListHeader.propTypes = {
	numRevisions: PropTypes.number.isRequired,

	// localize
	translate: PropTypes.func.isRequired,
};

export default localize( EditorRevisionsListHeader );
