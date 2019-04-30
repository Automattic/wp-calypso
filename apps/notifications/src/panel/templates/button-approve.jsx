/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { setApproveStatus } from '../flux/note-actions';
import ActionButton from './action-button';
import { keys } from '../helpers/input';
import { getReferenceId } from '../helpers/notes';

const ApproveButton = ( { isApproved, note, translate } ) => (
	<ActionButton
		{ ...{
			icon: 'checkmark',
			isActive: isApproved,
			hotkey: keys.KEY_A,
			onToggle: () =>
				setApproveStatus(
					note.id,
					getReferenceId( note, 'site' ),
					getReferenceId( note, 'comment' ),
					! isApproved,
					note.type
				),
			text: isApproved
				? translate( 'Approved', { context: 'verb: past-tense' } )
				: translate( 'Approve', { context: 'verb: imperative' } ),
			title: isApproved
				? translate( 'Unapprove comment', { context: 'verb: imperative' } )
				: translate( 'Approve comment', { context: 'verb: imperative' } ),
		} }
	/>
);

ApproveButton.propTypes = {
	isApproved: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( ApproveButton );
