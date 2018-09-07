/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import { showGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';

function EditorGutenbergOptInSidebar( { translate, showDialog } ) {
	return (
		<div className="editor-gutenberg-opt-in-sidebar">
			<img src="/calypso/images/illustrations/gutenberg-mini.svg" alt="" />
			<p>{ translate( 'Try our new editor and level-up your layout.' ) }</p>
			<Button onClick={ showDialog } action="show">
				{ translate( 'Learn more' ) }
			</Button>
		</div>
	);
}

EditorGutenbergOptInSidebar.propTypes = {
	// connected properties
	translate: PropTypes.func,
	showDialog: PropTypes.func,
};

export default connect(
	null,
	{
		showDialog: showGutenbergOptInDialog,
	}
)( localize( EditorGutenbergOptInSidebar ) );
