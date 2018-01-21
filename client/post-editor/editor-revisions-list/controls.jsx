/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const EditorRevisionsListControls = ( { translate } ) => {
	return (
		<div className="editor-revisions-list__controls">
			<Button className="editor-revisions-list__split-button" compact>
				{ translate( 'Split' ) }
			</Button>
			<Button className="editor-revisions-list__unified-button" compact>
				{ translate( 'Unified' ) }
			</Button>
		</div>
	);
};

EditorRevisionsListControls.propTypes = {
	// localize
	translate: PropTypes.func.isRequired,
};

export default localize( EditorRevisionsListControls );
