/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { trashNote } from '../state/notes/thunks';
import ActionButton from './action-button';
import { keys } from '../helpers/input';
import { connect } from 'react-redux';

const TrashButton = ( { note, translate, updateUndoBar, trashNote } ) => (
	<ActionButton
		{ ...{
			icon: 'trash',
			isActive: false,
			hotkey: keys.KEY_T,
			onToggle: () => {
				trashNote( note );
				updateUndoBar( 'trash', note );
			},
			text: translate( 'Trash', { context: 'verb: imperative' } ),
			title: translate( 'Trash comment', { context: 'verb: imperative' } ),
		} }
	/>
);

TrashButton.propTypes = {
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { trashNote } )( localize( TrashButton ) );
